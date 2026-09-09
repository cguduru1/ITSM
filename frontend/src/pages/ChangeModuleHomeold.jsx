// ./src/pages/ChangeModuleHome.jsx
import React, { useMemo, useCallback } from "react";
import ModuleTile from "../components/ModuleTile.jsx";
import usePermissions from "../hooks/usePermissions.js";
import useTileOrder from "../hooks/useTileOrder.js";
import "../styles/changeModule.css";

// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";

// 🔴 Move static arrays OUTSIDE the component so references remain stable across re-render
const ALL_TILES = [
  {
    id: "requests",
    title: "Change Requests",
    subtitle: "Create, view and manage change requests",
    link: "/changes/list",
    color: "#556EE6",
    icon: "requests",
    required: { resource: "change_request", action: "read" }
  },
  {
    id: "calendar",
    title: "Change Calendar",
    subtitle: "See scheduled windows and conflicts",
    link: "/change-calendar",
    color: "#4ECDC4",
    icon: "calendar",
    required: { resource: "change_request", action: "read" }
  },
  {
    id: "analytics",
    title: "Analytics Dashboard",
    subtitle: "Risk, state distribution and KPIs",
    link: "/change-analytics",
    color: "#F7B731",
    icon: "analytics",
    required: { resource: "change_request", action: "read" }
  },
  {
    id: "timeline",
    title: "Change Timeline",
    subtitle: "Gantt view of scheduled changes",
    link: "/change-timeline",
    color: "#FF6B6B",
    icon: "timeline",
    required: { resource: "change_request", action: "read" }
  },
  {
    id: "cmdb",
    title: "CMDB Integration",
    subtitle: "CI relationships and impact analysis",
    link: "/cmdb",
    color: "#9C27B0",
    icon: "cmdb",
    required: { resource: "asset", action: "read" }
  },
  {
    id: "admin",
    title: "Change Admin",
    subtitle: "Roles, approvers and mappings",
    link: "/change-admin",
    color: "#00A8FF",
    icon: "admin",
    required: { resource: "role", action: "update" }
  }
];

// Stable array reference for default tile IDs
const DEFAULT_TILE_IDS = ALL_TILES.map(t => t.id);

export default function ChangeModuleHome() {
  const { permissions, loading: permLoading } = usePermissions();

  // Use stable reference
  const { tileOrder, saveTileOrder } = useTileOrder(DEFAULT_TILE_IDS);

  // Permission checker
  const can = useCallback(
    (resource, action) => {
      if (!resource || !action) return true;
      if (permLoading) return false;
      return Boolean(permissions?.[resource]?.includes(action));
    },
    [permissions, permLoading]
  );

  // Attach visibility flags
  const tilesWithVisibility = useMemo(() => {
    return ALL_TILES.map(t => ({
      ...t,
      allowed: can(t.required?.resource, t.required?.action)
    }));
  }, [can]);

  // Apply saved tile order + admin priority
  const orderedTiles = useMemo(() => {
    const idToTile = Object.fromEntries(tilesWithVisibility.map(t => [t.id, t]));
    const ordered = [];

    const activeOrder = tileOrder && tileOrder.length > 0 ? tileOrder : DEFAULT_TILE_IDS;

    activeOrder.forEach(id => {
      if (idToTile[id]) ordered.push(idToTile[id]);
    });

    tilesWithVisibility.forEach(t => {
      if (!ordered.find(x => x.id === t.id)) ordered.push(t);
    });

    if (can("role", "update")) {
      const idx = ordered.findIndex(t => t.id === "admin");
      if (idx > 0) {
        const [adminTile] = ordered.splice(idx, 1);
        ordered.unshift(adminTile);
      }
    }

    return ordered;
  }, [tilesWithVisibility, tileOrder, can]);

  // Drag & drop reorder
  const onDragEnd = useCallback(
    (result) => {
      if (!result.destination) return;

      const src = result.source.index;
      const dest = result.destination.index;

      const newOrder = Array.from(orderedTiles.map(t => t.id));
      const [moved] = newOrder.splice(src, 1);
      newOrder.splice(dest, 0, moved);

      saveTileOrder(newOrder);
    },
    [orderedTiles, saveTileOrder]
  );

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };

  const item = {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="change-module-root">
      <header className="cm-header">
        <div className="cm-header-left">
          <h1>Change Management</h1>
          <p className="muted">
            One place for requests, calendar, analytics, timeline and CMDB
          </p>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="cm-tiles" direction="horizontal" type="TILE">
          {(provided) => (
            <motion.section
              className="cm-tiles-grid"
              role="navigation"
              aria-label="Change module navigation"
              ref={provided.innerRef}
              {...provided.droppableProps}
              variants={container}
              initial="hidden"
              animate="show"
            > 
              <AnimatePresence>
                {orderedTiles.map((tile, index) => (
                  <Draggable
                    key={tile.id}
                    draggableId={tile.id}
                    index={index}
                    isDragDisabled={!tile.allowed}
                  >
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
                          required={tile.required}
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
