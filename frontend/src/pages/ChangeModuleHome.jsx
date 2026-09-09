import React, { useMemo, useCallback } from "react";
import ModuleTile from "../components/ModuleTile";
import usePermissions from "../hooks/usePermissions";
import useTileOrder from "../hooks/useTileOrder";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/changeQuantum.css";

const ALL_TILES = [
  { id: "normal", title: "Normal Change", subtitle: "Full lifecycle change", link: "/workspace/change/normal", color: "#556EE6", icon: "🔄", required: { resource: "change_request", action: "read" } },
  { id: "standard", title: "Standard Change", subtitle: "Preapproved low risk", link: "/workspace/change/standard", color: "#4ECDC4", icon: "📋", required: { resource: "change_request", action: "read" } },
  { id: "emergency", title: "Emergency Change", subtitle: "Fast track fixes", link: "/workspace/change/emergency", color: "#FF6B6B", icon: "⚡", required: { resource: "change_request", action: "create" } },
  { id: "devops", title: "DevOps Models", subtitle: "CI/CD driven flows", link: "/workspace/change/devops", color: "#9C27B0", icon: "💻", required: { resource: "change_model", action: "read" } },
  { id: "csdm", title: "CI Mapping CSDM", subtitle: "Map CIs to services", link: "/workspace/change/csdm", color: "#00A8FF", icon: "🧩", required: { resource: "asset", action: "read" } },
  { id: "risk", title: "Risk Engine", subtitle: "Weighted assessments", link: "/workspace/change/risk", color: "#F7B731", icon: "📊", required: { resource: "risk", action: "read" } },
  { id: "conflicts", title: "Conflict Detection", subtitle: "Scheduling & blackouts", link: "/workspace/change/conflicts", color: "#FF8C42", icon: "🚨", required: { resource: "schedule", action: "read" } },
  { id: "decisions", title: "Decision Tables", subtitle: "Dynamic approval routing", link: "/workspace/change/decisions", color: "#7ED321", icon: "🗂️", required: { resource: "policy", action: "update" } },
  { id: "ops", title: "Service Ops Workspace", subtitle: "Task execution hub", link: "/workspace/change/ops", color: "#6B8E23", icon: "🛠️", required: { resource: "task", action: "read" } },
  { id: "cab", title: "CAB Workbench", subtitle: "Automated CAB agendas", link: "/workspace/change/cab", color: "#8A2BE2", icon: "👥", required: { resource: "cab", action: "read" } },
  { id: "success", title: "Change Success Score", subtitle: "Predictive analytics", link: "/workspace/change/success", color: "#2E8B57", icon: "📈", required: { resource: "analytics", action: "read" } },
  { id: "admin", title: "Change Admin", subtitle: "Roles and mappings", link: "/workspace/change/admin", color: "#3333FF", icon: "⚙️", required: { resource: "role", action: "update" } }
];

const DEFAULT_TILE_IDS = ALL_TILES.map(t => t.id);

export default function ChangeModuleHome() {
  const { permissions, loading: permLoading } = usePermissions();
  const { tileOrder, saveTileOrder } = useTileOrder(DEFAULT_TILE_IDS);

  const can = useCallback((resource, action) => {
    if (!resource || !action) return true;
    if (permLoading) return false;
    return Boolean(permissions?.[resource]?.includes(action));
  }, [permissions, permLoading]);

  const tilesWithVisibility = useMemo(() => ALL_TILES.map(t => ({ ...t, allowed: can(t.required?.resource, t.required?.action) })), [can]);

  const orderedTiles = useMemo(() => {
    const idToTile = Object.fromEntries(tilesWithVisibility.map(t => [t.id, t]));
    const activeOrder = tileOrder && tileOrder.length ? tileOrder : DEFAULT_TILE_IDS;
    const ordered = [];
    activeOrder.forEach(id => { if (idToTile[id]) ordered.push(idToTile[id]); });
    tilesWithVisibility.forEach(t => { if (!ordered.find(x => x.id === t.id)) ordered.push(t); });
    if (can("role", "update")) {
      const idx = ordered.findIndex(t => t.id === "admin");
      if (idx > 0) {
        const [adminTile] = ordered.splice(idx, 1);
        ordered.unshift(adminTile);
      }
    }
    return ordered;
  }, [tilesWithVisibility, tileOrder, can]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const src = result.source.index;
    const dest = result.destination.index;
    const newOrder = Array.from(orderedTiles.map(t => t.id));
    const [moved] = newOrder.splice(src, 1);
    newOrder.splice(dest, 0, moved);
    saveTileOrder(newOrder);
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="change-quantum-root">
      <header className="change-quantum-header">
        <div>
          <h2>Workspace Dashboard</h2>
          <p className="muted">Quick access to change models, governance and operations</p>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="change-tiles" direction="horizontal" type="TILE">
          {(provided) => (
            <motion.section
              className="change-tiles-grid"
              ref={provided.innerRef}
              {...provided.droppableProps}
              variants={container}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence>
                {orderedTiles.map((tile, index) => (
                  <Draggable key={tile.id} draggableId={tile.id} index={index} isDragDisabled={!tile.allowed}>
                    {(draggableProvided) => (
                      <motion.div
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                        variants={item}
                        layout
                        style={{ ...draggableProvided.draggableProps.style }}
                      >
                        <ModuleTile
                          title={tile.title}
                          subtitle={tile.subtitle}
                          link={tile.allowed ? tile.link : "#"}
                          color={tile.color}
                          icon={tile.icon}
                          disabled={!tile.allowed}
                        />
                      </motion.div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </AnimatePresence>
            </motion.section>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
