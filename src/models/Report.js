const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
  farmaco: {
    nomeCommerciale: { type: String, required: true },
    principioAttivo: { type: String, required: true },
    lotto: { type: String, required: false }
  },
  paziente: {
    eta: { type: Number, required: true },
    sesso: { type: String, enum: ['M', 'F', 'Altro'], required: true }
  },
  reazione: {
    descrizione: { type: String, required: true },
    gravita: { type: String, enum: ['Lieve', 'Moderata', 'Grave', 'Sconosciuta'], default: 'Sconosciuta' },
    sintomiCategorizzati: {
      type: [String],
      default: []
    }
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  localita: {
    type: {
      type: String,
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number], // [longitudine, latitudine]
      required: false
    }
  }
}, {
  timestamps: true
});

// Indici per le query
ReportSchema.index({ 'reazione.descrizione': 'text', 'farmaco.nomeCommerciale': 'text' });
ReportSchema.index({ localita: '2dsphere' });

module.exports = mongoose.model('Report', ReportSchema);
