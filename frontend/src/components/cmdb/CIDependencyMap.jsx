import React, { useState } from "react";

export default function CIDependencyMap({ activeCi }) {
  // Mock relationship data mapped to common CMDB types
  const mockRelationships = {
    Server: {
      upstream: [
        { id: "us-1", name: "SAN-Storage-01", type: "Storage", status: "Operational" },
        { id: "us-2", name: "Core-Switch-04", type: "Network Switch", status: "Operational" }
      ],
      downstream: [
        { id: "ds-1", name: "Production-DB-Cluster", type: "Database", status: "Warning" },
        { id: "ds-2", name: "Customer-Portal-API", type: "Application", status: "Operational" }
      ]
    },
    Database: {
      upstream: [
        { id: "us-3", name: "Linux-AppServer-01", type: "Server", status: "Operational" },
        { id: "us-4", name: "AWS-EC2-Volume-B", type: "Storage", status: "Operational" }
      ],
      downstream: [
        { id: "ds-3", name: "Billing-Service", type: "Service", status: "Critical" },
        { id: "ds-4", name: "Analytics-Dashboard", type: "Application", status: "Operational" }
      ]
    },
    default: {
      upstream: [{ id: "us-gen", name: "Core-Infrastructure-Switch", type: "Network", status: "Operational" }],
      downstream: [{ id: "ds-gen", name: "Enterprise-Gateway-Service", type: "Service", status: "Operational" }]
    }
  };

  const rels = mockRelationships[activeCi?.type] || mockRelationships.default;
  const [selectedRel, setSelectedRel] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "Critical": return "bg-rose-500 text-white";
      case "Warning": return "bg-amber-500 text-slate-900";
      default: return "bg-emerald-500 text-white";
    }
  };

  if (!activeCi) {
    return (
      <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400">
        Select a configuration item from the table explorer below to inspect architecture relations.
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl font-sans mb-8">
      {/* Header Info Banner */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Dependency Impact Map</span>
          <h3 className="text-lg font-bold text-white mt-0.5">{activeCi.name} Relationships</h3>
        </div>
        <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800">
          Class: <strong className="text-slate-200">{activeCi.type || "Hardware"}</strong>
        </div>
      </div>

      {/* Relationship Flow Visualizer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative">
        
        {/* COLUMN 1: UPSTREAM DEPENDENCIES */}
        <div className="flex flex-col gap-4">
          <div className="text-center md:text-left mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">▲ Upstream Parents</h4>
            <p className="text-[11px] text-slate-500">Items this asset requires to run</p>
          </div>
          {rels.upstream.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedRel(item)}
              className="group p-3.5 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-800 hover:border-blue-500/50 cursor-pointer transition relative flex items-center justify-between"
            >
              <div>
                <h5 className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition">{item.name}</h5>
                <span className="text-[11px] text-slate-500">{item.type}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 font-bold rounded ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
              {/* Connector line hints for desktop screens */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-4 h-[1px] bg-slate-800 group-hover:bg-blue-500/30" />
            </div>
          ))}
        </div>

        {/* COLUMN 2: CENTER TARGET CONFIGURATION ITEM */}
        <div className="flex flex-col items-center justify-center p-6 bg-blue-950/20 border-2 border-blue-500/30 rounded-xl relative shadow-lg shadow-blue-950/20">
          <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/40 flex items-center justify-center mb-3">
            <span className="text-xl">🖥️</span>
          </div>
          <h4 className="text-base font-bold text-white text-center">{activeCi.name}</h4>
          <span className="text-xs text-blue-400 mt-0.5 bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-800/50">
            Target CI
          </span>
          <div className="mt-3 flex gap-4 text-[11px] text-slate-400">
            <span>Env: <strong className="text-slate-200">{activeCi.environment || "N/A"}</strong></span>
            <span>Risk: <strong className="text-amber-400">{activeCi.criticality || "Normal"}</strong></span>
          </div>
        </div>

        {/* COLUMN 3: DOWNSTREAM IMPACTS */}
        <div className="flex flex-col gap-4">
          <div className="text-center md:text-left mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">▼ Downstream Impact</h4>
            <p className="text-[11px] text-slate-500">Items impacted if this asset fails</p>
          </div>
          {rels.downstream.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedRel(item)}
              className="group p-3.5 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-800 hover:border-rose-500/50 cursor-pointer transition relative flex items-center justify-between"
            >
              {/* Connector line hints for desktop screens */}
              <div className="hidden md:block absolute top-1/2 -left-4 w-4 h-[1px] bg-slate-800 group-hover:bg-rose-500/30" />
              <div>
                <h5 className="text-sm font-semibold text-slate-200 group-hover:text-rose-400 transition">{item.name}</h5>
                <span className="text-[11px] text-slate-500">{item.type}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 font-bold rounded ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* INFOBAR: DRAWER POPUP FOR ACTIVE NODE HOVER/SELECTION */}
      {selectedRel && (
        <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between animate-fadeIn text-sm">
          <div className="flex items-center gap-3">
            <span className="text-base">ℹ️</span>
            <div>
              <p className="text-slate-200 font-medium">
                Node Focus: <strong className="text-blue-400">{selectedRel.name}</strong> ({selectedRel.type})
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Impact Vector Check: Status evaluated as <span className="underline font-semibold">{selectedRel.status}</span>.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedRel(null)} 
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded transition"
          >
            Clear Focus
          </button>
        </div>
      )}
    </div>
  );
}
