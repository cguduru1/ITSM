import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function CABTimeline({ cabMeetings, onReschedule }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(cabMeetings);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onReschedule(reordered); // update state with new order
  };

  return (
    <section className="quantum-panel">
      <h3 className="quantum-heading">CAB Timeline</h3>
      <div className="quantum-card cab-timeline">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="timeline">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef} className="timeline-list">
                {cabMeetings.map((m, idx) => (
                  <Draggable key={idx} draggableId={`cab-${idx}`} index={idx}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`timeline-item ${m.status.toLowerCase()}`}
                      >
                        <div className="timeline-date">{m.date}</div>
                        <div className="timeline-content">
                          <strong>{m.agenda}</strong>
                          <p>Status: {m.status}</p>
                          <p>Attendees: {m.attendees.join(", ")}</p>
                          <p>Signed Off: {m.signedOff ? "✅ Yes" : "❌ No"}</p>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </section>
  );
}
