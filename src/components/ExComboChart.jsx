// ─── ExComboChart — combo chart partagé (charge max + volume + cible) ───
const { useState: uSWC, useEffect: uEWC, useRef: uRWC } = React;

window.ExComboChart = function ExComboChart({ exName, hist, goal, height, livePoint, compact, maxPoints, targetKg }) {
  const cRef    = uRWC(null);
  const instRef = uRWC(null);
  const [period, setPeriod] = uSWC('seances');
  const h = height || 190;

  uEWC(() => {
    if (!cRef.current) return;

    // ── raw data historique ──
    const rawData = [...hist].reverse().flatMap(entry =>
      entry.exercises.filter(e => e.name === exName).map(e => ({
        date:  entry.date,
        maxKg: Math.max(0, ...e.sets.filter(s => s.done).map(s => parseFloat(s.kg) || 0)),
        vol:   e.sets.filter(s => s.done).reduce((a, s) => a + (parseFloat(s.kg)||0) * (parseFloat(s.reps)||0), 0),
        sets:  e.sets.filter(s => s.done),
        live:  false,
      }))
    ).filter(d => d.sets.length > 0);

    // ── point live (séance en cours) ──
    if (livePoint && livePoint.maxKg > 0) {
      rawData.push({ date: livePoint.date, maxKg: livePoint.maxKg, vol: livePoint.vol, sets: [{}], live: true });
    }

    // Limite aux N derniers points si demandé
    if (maxPoints && rawData.length > maxPoints) rawData.splice(0, rawData.length - maxPoints);

    if (rawData.length < 2) return;

    // ── groupement selon la période ──
    let grouped;
    if (period === 'seances') {
      grouped = rawData.map(d => ({ label: window.dateFr(d.date), maxKg: d.maxKg, vol: d.vol, date: new Date(d.date) }));
    } else {
      const map = {};
      rawData.forEach(d => {
        const k = period === 'semaines' ? window.getWeekKey(d.date) : window.getMonthKey(d.date);
        if (!map[k]) map[k] = { k, entries: [] };
        map[k].entries.push(d);
      });
      grouped = Object.values(map).map(g => ({
        label:  period === 'semaines'
          ? new Date(g.k).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
          : window.getMonthLabel(g.k),
        maxKg:  Math.max(...g.entries.map(e => e.maxKg)),
        vol:    g.entries.reduce((a, e) => a + e.vol, 0),
        date:   new Date(g.k),
      }));
    }

    if (grouped.length < 2) return;

    // ── courbe cible ──
    const targetCurve = (() => {
      if (!goal || !goal.date || grouped.length === 0) return [];
      const s   = grouped[grouped.length - 1];
      const sd  = s.date;
      const ed  = new Date(goal.date);
      const msW = 7 * 24 * 3600 * 1000;
      const tw  = Math.max(1, Math.round((ed - sd) / msW));
      const kpw = (goal.kg - s.maxKg) / tw;
      const pts = [];
      for (let w = 0; w <= tw; w++) {
        const d = new Date(sd.getTime() + w * msW);
        pts.push({ date: d, kg: Math.round((s.maxKg + kpw * w) * 100) / 100, label: window.dateFr(d.getTime()) });
      }
      return pts;
    })();

    // ── fusion labels réel + cible ──
    let labels  = grouped.map(d => d.label);
    let volData = grouped.map(d => d.vol);
    let kgData  = grouped.map(d => d.maxKg);
    let tgtData = grouped.map(() => null);

    if (targetCurve.length > 0 && !compact) {
      const allMap = new Map();
      grouped.forEach(d => allMap.set(d.label, { vol: d.vol, kg: d.maxKg, tgt: null, date: d.date }));
      targetCurve.forEach(t => {
        if (!allMap.has(t.label)) allMap.set(t.label, { vol: null, kg: null, tgt: t.kg, date: t.date });
        else allMap.get(t.label).tgt = t.kg;
      });
      const sorted = [...allMap.entries()].sort((a, b) => a[1].date - b[1].date);
      labels  = sorted.map(e => e[0]);
      volData = sorted.map(e => e[1].vol);
      kgData  = sorted.map(e => e[1].kg);
      tgtData = sorted.map(e => e[1].tgt);
    }

    const lastRealIdx = kgData.reduce((li, v, i) => v !== null ? i : li, -1);
    const kgVals = kgData.filter(v => v !== null);
    const histMax = rawData.filter(d => !d.live).length ? Math.max(...rawData.filter(d=>!d.live).map(d => d.maxKg)) : 0;
    const isPR = livePoint && livePoint.maxKg > 0 && livePoint.maxKg > histMax;
    const margin = compact ? 1.5 : 3;
    const minY  = kgVals.length ? Math.min(...kgVals) - margin : undefined;
    const maxY  = compact
      ? (kgVals.length ? Math.max(...kgVals) + margin : undefined)
      : (goal ? Math.max(goal.kg + 5, ...kgVals) : undefined);

    // Couleur par point : orange pour live, vert si PR, bleu sinon
    const ptColor = (v, i) => {
      if (v === null) return '#0D7A8A';
      if (i === lastRealIdx && livePoint && livePoint.maxKg > 0) return isPR ? '#22C55E' : '#F59E0B';
      return '#0D7A8A';
    };
    const ptRadius = (v, i) => {
      if (v === null) return 0;
      if (i === lastRealIdx && livePoint && livePoint.maxKg > 0) return 6;
      return 4;
    };

    if (instRef.current) { instRef.current.destroy(); instRef.current = null; }

    const datasets = [
      {
        type: 'bar', data: volData,
        backgroundColor: '#22C55E2A', borderColor: '#22C55E55', borderWidth: 1, borderRadius: 3,
        label: 'Volume (kg·reps)', yAxisID: 'yVol', order: 2,
      },
      {
        type: 'line', data: kgData,
        borderColor: '#0D7A8A', backgroundColor: 'transparent',
        tension: 0.35, borderWidth: 2, spanGaps: false,
        pointRadius: kgData.map((v, i) => ptRadius(v, i)),
        pointBackgroundColor: kgData.map((v, i) => ptColor(v, i)),
        label: 'Charge max', yAxisID: 'yKg', order: 1,
      },
    ];
    if (targetCurve.length > 0 && !compact) {
      datasets.push({
        type: 'line', data: tgtData,
        borderColor: '#22C55E', borderWidth: 2, borderDash: [6, 4],
        pointRadius: tgtData.map(v => v !== null ? 3 : 0),
        pointBackgroundColor: '#22C55E', fill: false, tension: 0.2, spanGaps: false,
        label: 'Cible', yAxisID: 'yKg', order: 0,
      });
    }

    // Point prévisionnel séance (compact uniquement)
    if (targetKg && targetKg > 0) {
      const prevData = labels.map(() => null);
      prevData.push(targetKg);
      labels.push('Prévu');
      volData.push(null);
      kgData.push(null);
      tgtData.push(null);
      datasets.forEach(d => { if (Array.isArray(d.data)) d.data.push(null); });
      datasets.push({
        type: 'line', data: prevData,
        borderColor: 'transparent', backgroundColor: 'transparent',
        pointRadius: prevData.map(v => v !== null ? 7 : 0),
        pointStyle: prevData.map(v => v !== null ? 'rectRot' : 'circle'),
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#8B5CF6',
        fill: false, label: 'Prévu', yAxisID: 'yKg', order: 0, spanGaps: false,
      });
    }

    instRef.current = new Chart(cRef.current, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: {
            display: !compact,
            labels: { color: '#888', font: { size: 11 }, boxWidth: 12, padding: 12,
              filter: item => item.text !== 'Cible' || targetCurve.length > 0 },
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                if (ctx.parsed.y === null) return null;
                if (ctx.dataset.label === 'Volume (kg·reps)') return 'Volume: ' + ctx.parsed.y + ' kg·reps';
                if (ctx.dataset.label === 'Cible') return 'Cible: ' + ctx.parsed.y + ' kg';
                return ctx.parsed.y + ' kg';
              }
            }
          }
        },
        scales: {
          x:    { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', font: { size: 10 }, maxRotation: 45 } },
          yKg:  { type: 'linear', position: 'left',  min: minY, max: maxY, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', font: { size: 11 }, callback: v => v + ' kg' } },
          yVol: { type: 'linear', position: 'right', grid: { display: false }, ...(compact && volData.filter(Boolean).length ? { min: Math.min(...volData.filter(Boolean)) * 0.95, max: Math.max(...volData.filter(Boolean)) * 1.05 } : {}), ticks: { color: '#22C55E66', font: { size: 10 } } },
        },
      },
    });

    return () => { if (instRef.current) { instRef.current.destroy(); instRef.current = null; } };
  }, [exName, period, JSON.stringify(goal), JSON.stringify(livePoint), targetKg]);

  const btnStyle = p => ({
    background: period === p ? '#1E1E22' : 'transparent',
    border: period === p ? '1px solid #333' : '1px solid transparent',
    borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', color: period === p ? '#fff' : '#555',
  });

  return (
    <div>
      {!compact && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          <button style={btnStyle('seances')}  onClick={() => setPeriod('seances')}>Séances</button>
          <button style={btnStyle('semaines')} onClick={() => setPeriod('semaines')}>Semaines</button>
          <button style={btnStyle('mois')}     onClick={() => setPeriod('mois')}>Mois</button>
        </div>
      )}
      <div style={{ position: 'relative', height: h }}><canvas ref={cRef}/></div>
    </div>
  );
};
