// realtime/socket.js
import socketio from "socket.io";
import ChangeRequest from "../models/ChangeRequest";

function initSocket(server) {
  const io = socketio(server, { path: '/realtime' });

  // Emit initial aggregates on connection
  io.on('connection', async (socket) => {
    const stateCounts = await ChangeRequest.aggregate([{ $group: { _id: "$state", count: { $sum: 1 } } }]);
    socket.emit('changes:init', { stateCounts });
  });

  // Watch change_requests collection and broadcast updates
  const changeStream = ChangeRequest.watch([], { fullDocument: 'updateLookup' });
  changeStream.on('change', async change => {
    try {
      // small optimization: compute minimal payload
      const payload = { op: change.operationType, doc: change.fullDocument };
      io.emit('changes:update', payload);
    } catch (e) {
      console.error('Change stream error', e);
    }
  });

  return io;
}

module.exports = initSocket;
