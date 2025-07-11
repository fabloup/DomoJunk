function getWindowDecision(tExt = 0, dExt = 0, tInt = 0, dInt = 0) {
  const ecartTemp         = tExt - tInt;
  const seuilTempExt      = 27.5;
  const seuilTempIntBase  = 26;
  const seuilTempEcart    = 1;
  const seuilDerive       = 0.1;

  const fermer =
    tExt >= seuilTempExt && (
      dExt > seuilDerive ||                             // condition 1 : ça chauffe dehors
      (dInt > seuilDerive && tInt > seuilTempIntBase) ||// condition 2 : ça chauffe dedans
      ecartTemp > seuilTempEcart                        // condition 3 : trop d'écart
    );

  const ouvrir =
    tExt < seuilTempExt;

  return {
    ouvrir,
    fermer,
    ouverture: (ouvrir && !fermer)
  };
}
    /* --- Suite de tests réalistes --- */
    mocha.setup('bdd'); const { expect } = chai;

    describe('Scénarios météo crédibles', () => {
      /**
       * 1) Petit matin d’été frais
       *    - Ext : 18 °C, tendance ↘︎ (‑0.3 °C/h)
       *    - Int : 23 °C, stable
       *    ↳ On PEUT ouvrir (fraîcheur entrante, aucune condition de fermeture)
       */
      it('Matin frais : ouverture conseillée', () => {
        const r = getWindowDecision(18, 0.2, 23, 0.3);
        expect(r).to.deep.equal({ ouvrir: true, fermer: false, ouverture: true });
      });

      /**
       * 2) Après‑midi de canicule
       *    - Ext : 35 °C, tendance ↗︎ (+0.4 °C/h)
       *    - Int : 28 °C, tendance ↗︎ (+0.2 °C/h)
       *    ↳ FERMER (trop chaud dehors, dérivées positives)
       */
      it('Après‑midi caniculaire : fermeture obligatoire', () => {
        const r = getWindowDecision(35, 0.4, 28, 0.2);
        expect(r).to.deep.equal({ ouvrir: false, fermer: true, ouverture: false });
      });

      /**
       * 3) Soirée encore chaude mais refroidissement lent
       *    - Ext : 30 °C, tendance ↘︎ (‑0.3 °C/h)
       *    - Int : 27 °C, tendance ↗︎ (+0.15 °C/h)
       *    ↳ Les deux conditions sont vraies (ouvrir ET fermer) → priorité à fermer
       */
      it('Soirée chaude en descente douce : on reste fermé', () => {
        const r = getWindowDecision(30, -0.3, 27, 0.15);
        expect(r).to.deep.equal({ ouvrir: false, fermer: true, ouverture: false });
      });
      
       /**
       * 3') Soirée encore chaude mais refroidissement rapide
       *    - Ext : 27 °C, tendance ↘︎ (‑0.5 °C/h)
       *    - Int : 27 °C, tendance ↗︎ (+0.15 °C/h)
       *    ↳ Les deux conditions sont vraies (ouvrir ET fermer) → priorité à fermer
       */
      it('Soirée chaude en descente rapide : on ouvre', () => {
        const r = getWindowDecision(27, -0.5, 27, 0.15);
        expect(r).to.deep.equal({ ouvrir: true, fermer: false, ouverture: true });
      });

      /**
       * 4) Nuit très fraîche
       *    - Ext : 16 °C, tendance ↘︎ (‑0.2 °C/h)
       *    - Int : 21 °C, tendance stable
       *    ↳ On ouvre pour rafraîchir la maison
       */
      it('Nuit fraîche : ouverture pour rafraîchir', () => {
        const r = getWindowDecision(16, -0.2, 21, 0);
        expect(r).to.deep.equal({ ouvrir: true, fermer: false, ouverture: true });
      });

      /**
       * 5) Printemps doux, températures quasi égales (aucune action)
       *    - Ext : 22 °C, tendance stable
       *    - Int : 22.5 °C, tendance stable
       *    ↳ Il faut ouvrir
       */
      it('Printemps doux : aucune action', () => {
        const r = getWindowDecision(22, 0, 22.5, 0);
        expect(r).to.deep.equal({ ouvrir: true, fermer: false, ouverture: true });
      });
      
      /**
       * 6) Printemps doux, températures quasi égales (aucune action)
       *    - Ext : 28 °C, tendance stable
       *    - Int : 28 °C, tendance stable
       *    ↳ Il faut fermer
       */
      it('Matin chaud été : il faut fermé', () => {
        const r = getWindowDecision(28, 0.5,28, 0);
        expect(r).to.deep.equal({ ouvrir: false, fermer: true, ouverture: false });
      });
    });

  describe('Cas de test été – selon logique métier simplifiée', () => {
  it('1) Températures en hausse > 28°C → on ferme', () => {
    const r = getWindowDecision(30, 0.3, 27.5, 0.2);
    expect(r).to.deep.equal({ ouvrir: false, fermer: true, ouverture: false });
  });

  it('2) Temp ext < 28°C, descend, et plus frais que dedans → on ouvre', () => {
    const r = getWindowDecision(26, -0.3, 28, 0.2);
    expect(r).to.deep.equal({ ouvrir: true, fermer: false, ouverture: true });
  });

  it('3) Temp ext < 28°C, descend, peu importe l’intérieur → on ouvre', () => {
    const r = getWindowDecision(25, -0.5, 23, -0.1);
    expect(r).to.deep.equal({ ouvrir: true, fermer: false, ouverture: true });
  });

  it('4) Temp ext < 28°C, monte, peu importe l’intérieur → on ouvre', () => {
    const r = getWindowDecision(26, 0.3, 28, 0.2);
    expect(r).to.deep.equal({ ouvrir: true, fermer: false, ouverture: true });
  });

  it('5) Temp ext < 28°C, stable, peu importe l’intérieur → on ouvre', () => {
    const r = getWindowDecision(27, 0.0, 29, -0.1);
    expect(r).to.deep.equal({ ouvrir: true, fermer: false, ouverture: true });
  });
});

describe('Cas supplémentaires été – stabilité & baisse', () => {
  it('6) Temp ext et int stables > 28°C → on ferme', () => {
    const r = getWindowDecision(28, 0.0, 28, 0.0);
    expect(r).to.deep.equal({ ouvrir: false, fermer: false, ouverture: false });
  });

  it('7) Temp ext < 28°C, baisse, int stable, plus frais dehors → on ouvre', () => {
    const r = getWindowDecision(26, -0.2, 27.5, 0.0);
    expect(r).to.deep.equal({ ouvrir: true, fermer: false, ouverture: true });
  });

  it('8) Temp ext < 28°C, stable, peu importe intérieur → on ouvre', () => {
    const r = getWindowDecision(27, 0.0, 30, 0.2);
    expect(r).to.deep.equal({ ouvrir: true, fermer: false, ouverture: true });
  });
});


    mocha.run();
