// ./scripts/seedApproverMappings.js
// ESM seed script to populate common approver mappings.
// Run with: node ./scripts/seedApproverMappings.js
import mongoose from 'mongoose';
import ApproverMapping from '../models/ApproverMapping.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/yourdb';

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const seeds = [
    { changeType: 'Database', category: 'Database', requiredGroup: 'DBA', minApprovals: 1 },
    { changeType: 'Database', category: 'Production', requiredGroup: 'SRE', minApprovals: 1 },
    { changeType: 'Network', category: 'Network', requiredGroup: 'NetworkOps', minApprovals: 1 },
    { changeType: 'Network', category: 'Security', requiredGroup: 'Security', minApprovals: 1 },
    { changeType: 'Application', category: 'Application', requiredGroup: 'AppOwners', minApprovals: 1 },
    { changeType: 'All', category: '', requiredGroup: 'ChangeManager', minApprovals: 1 },
    // Emergency mapping: still require post-incident review group
    { changeType: 'Emergency', category: '', requiredGroup: 'PostIncidentReview', minApprovals: 1 }
  ];

  for (const s of seeds) {
    // upsert by changeType + requiredGroup + category
    await ApproverMapping.updateOne(
      { changeType: s.changeType, requiredGroup: s.requiredGroup, category: s.category || '' },
      { $set: s },
      { upsert: true }
    );
    console.log('Upserted mapping:', s);
  }

  console.log('Seeding complete.');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed', err);
  process.exit(1);
});
