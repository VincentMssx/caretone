"use client";

import { useState } from "react";

type Patient = {
  id: string;
  name: string;
  time: string;
  task: string;
  color: string;
};

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  patientId: Patient;
};

export default function PatientDrawer({ isOpen, onClose, patientId }: DrawerProps) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 h-full w-full md:w-[500px] bg-surface-container-lowest shadow-2xl z-[70] transition-transform duration-300 overflow-hidden flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-lg border-b border-outline-variant flex items-center justify-between bg-primary-container text-on-primary-container">
          <div className="flex items-center gap-md">
            <button className="material-symbols-outlined hover:bg-white/20 p-2 rounded-full transition-colors" onClick={onClose}>
              close
            </button>
            <h2 className="font-headline-sm text-headline-sm font-bold">Fiche Patient</h2>
          </div>
          <div className="flex gap-sm">
            <button className="material-symbols-outlined hover:bg-white/20 p-2 rounded-full">edit</button>
            <button className="material-symbols-outlined hover:bg-white/20 p-2 rounded-full">print</button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-lg flex flex-col gap-xl">
          <section className="flex flex-col items-center text-center gap-md py-md bg-surface-container rounded-2xl">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
              <div className="w-full h-full flex items-center justify-center bg-surface-container">
                <span className="material-symbols-outlined text-4xl text-primary">person</span>
              </div>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">{patientId.name}</h3>
              <p className="text-on-surface-variant font-body-md">Né le 12/05/1948 (78 ans)</p>
              <div className="flex justify-center gap-sm mt-sm">
                <span className="px-md py-xs bg-outline-variant/30 rounded-full text-label-sm font-label-sm">Groupe O+</span>
                <span className="px-md py-xs bg-outline-variant/30 rounded-full text-label-sm font-label-sm">N° 1 48 05 75...</span>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-sm">
            <h4 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest flex items-center gap-xs">
              <span className="material-symbols-outlined text-error text-[20px]">warning</span>
              Points d'attention
            </h4>
            <div className="flex flex-wrap gap-sm">
              <span className="px-md py-sm bg-error-container text-error rounded-xl font-label-md flex items-center gap-xs">
                <span className="material-symbols-outlined text-md">block</span>
                Allergie: Pénicilline
              </span>
              <span className="px-md py-sm bg-tertiary-container/20 text-on-tertiary-container rounded-xl font-label-md flex items-center gap-xs">
                <span className="material-symbols-outlined text-md">heart_broken</span>
                Insuffisance cardiaque
              </span>
              <span className="px-md py-sm bg-secondary-container/30 text-on-secondary-container rounded-xl font-label-md">Diabète Type 2</span>
            </div>
          </section>

          <section className="flex flex-col gap-lg">
            <h4 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest">Historique & Timeline</h4>
            <div className="relative border-l-2 border-outline-variant ml-3 flex flex-col gap-xl">
              <div className="relative pl-lg">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary ring-4 ring-white"></div>
                <div className="flex flex-col gap-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-label-lg text-label-lg text-primary">Aujourd'hui, 08:30</span>
                    <span className="text-on-surface-variant text-label-sm italic">Par Julie R.</span>
                  </div>
                  <div className="bg-surface p-md rounded-xl border border-outline-variant">
                    <p className="font-bold text-on-surface text-body-sm">Visite Matinale</p>
                    <p className="text-body-sm text-on-surface-variant mt-xs opacity-70">Glycémie à 1.45. Pansement du pied droit refait. Propre, pas d'exsudat. Patient se plaint de fatigue.</p>
                    <div className="mt-md flex gap-sm">
                      <button className="text-primary font-label-md flex items-center gap-xs bg-primary/10 px-md py-xs rounded-lg">
                        <span className="material-symbols-outlined text-[16px]">play_circle</span>
                        Écouter transmission
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="p-lg bg-surface-container-high border-t border-outline-variant">
          <button className="w-full py-md bg-primary text-on-primary rounded-xl font-label-lg flex items-center justify-center gap-md hover:shadow-lg transition-all active:scale-95">
            <span className="material-symbols-outlined">mic</span>
            Enregistrer une transmission
          </button>
        </div>
      </aside>
    </>
  );
}
