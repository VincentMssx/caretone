import { DarTransmission, DiffBadge } from '../types/transmission';

/**
 * Compares two consecutive medical passages for a patient and computes Git-like diff badges.
 */
export function calculateTransmissionDiff(
  current: DarTransmission,
  previous?: DarTransmission
): DiffBadge[] {
  const badges: DiffBadge[] = [];

  if (!previous) {
    // First passage entry
    badges.push({
      label: 'Nouveau Soin',
      type: 'new',
      value: `Init : ${current.cible}`
    });

    if (current.constantes.tension) {
      badges.push({
        label: 'Tension',
        type: 'neutral',
        value: current.constantes.tension
      });
    }

    if (current.constantes.glycemie) {
      badges.push({
        label: 'Glycémie',
        type: 'neutral',
        value: `${current.constantes.glycemie} g/L`
      });
    }

    return badges;
  }

  // 1. Compare Target / Soin
  if (current.cible && current.cible !== previous.cible) {
    badges.push({
      label: 'Soin / Cible',
      type: 'new',
      value: `Nouveau : ${current.cible}`
    });
  }

  // 2. Compare Tension
  if (current.constantes.tension) {
    const curTensStr = current.constantes.tension;
    const prevTensStr = previous.constantes.tension;

    if (!prevTensStr) {
      badges.push({
        label: 'Tension',
        type: 'new',
        value: `${curTensStr}`
      });
    } else {
      const curSystolic = parseInt(curTensStr.split('/')[0] || '0', 10);
      const prevSystolic = parseInt(prevTensStr.split('/')[0] || '0', 10);

      if (curSystolic > prevSystolic + 1) {
        badges.push({
          label: 'Tension',
          type: 'increase',
          value: `Tension ${curTensStr} (↑)`
        });
      } else if (curSystolic < prevSystolic - 1) {
        badges.push({
          label: 'Tension',
          type: 'decrease',
          value: `Tension ${curTensStr} (↓)`
        });
      } else {
        badges.push({
          label: 'Tension',
          type: 'neutral',
          value: `Tension ${curTensStr}`
        });
      }
    }
  }

  // 3. Compare Glycémie
  if (current.constantes.glycemie) {
    const curGlyc = parseFloat(current.constantes.glycemie.replace(',', '.'));
    const prevGlyc = previous.constantes.glycemie ? parseFloat(previous.constantes.glycemie.replace(',', '.')) : NaN;

    if (isNaN(prevGlyc)) {
      badges.push({
        label: 'Glycémie',
        type: 'new',
        value: `${current.constantes.glycemie} g/L`
      });
    } else if (curGlyc > prevGlyc + 0.1) {
      badges.push({
        label: 'Glycémie',
        type: 'increase',
        value: `Glycémie ${current.constantes.glycemie} g/L (↑)`
      });
    } else if (curGlyc < prevGlyc - 0.1) {
      badges.push({
        label: 'Glycémie',
        type: 'decrease',
        value: `Glycémie ${current.constantes.glycemie} g/L (↓)`
      });
    } else {
      badges.push({
        label: 'Glycémie',
        type: 'neutral',
        value: `Glycémie ${current.constantes.glycemie} g/L`
      });
    }
  }

  // 4. Compare Température
  if (current.constantes.temperature) {
    const curTemp = parseFloat(current.constantes.temperature.replace(',', '.'));
    const prevTemp = previous.constantes.temperature ? parseFloat(previous.constantes.temperature.replace(',', '.')) : NaN;

    if (!isNaN(prevTemp)) {
      if (curTemp > prevTemp + 0.3) {
        badges.push({
          label: 'Température',
          type: 'increase',
          value: `Temp. ${current.constantes.temperature}°C (↑)`
        });
      } else if (curTemp < prevTemp - 0.3) {
        badges.push({
          label: 'Température',
          type: 'decrease',
          value: `Temp. ${current.constantes.temperature}°C (↓)`
        });
      }
    } else {
      badges.push({
        label: 'Température',
        type: 'neutral',
        value: `Temp. ${current.constantes.temperature}°C`
      });
    }
  }

  return badges;
}
