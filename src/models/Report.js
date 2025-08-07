const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FarmacoSchema = new Schema({
  nomeCommerciale: { type: String, required: true },
  principioAttivo: { type: String },
  lotto: { type: String },
  dosaggio: { type: String },
  viaSomministrazione: { type: String },
  dataInizioTerapia: { type: Date },
  dataFineTerapia: { type: Date },
  indicazioneUso: { type: String }
}, { _id: false });

const ReportSchema = new Schema({
  tipoSegnalazione: {
    type: String,
    enum: ['Sanitario', 'Cittadino'],
    required: true
  },
  paziente: {
    iniziali: { type: String, maxlength: 3 },
    dataNascita: { type: Date },
    eta: { type: Number, required: true },
    sesso: { type: String, enum: ['M', 'F'], required: true },
    peso: { type: Number },
    altezza: { type: Number }
  },
  reazione: {
    descrizione: { type: String, required: true },
    dataInizio: { type: Date, required: true },
    dataFine: { type: Date },
    esito: {
      type: String,
      enum: ['Guarigione completa', 'Guarigione con postumi', 'In via di guarigione', 'Persistenza della reazione', 'Decesso', 'Sconosciuto'],
      required: true
    },
    gravita: {
      isGrave: { type: Boolean, default: false },
      decesso: { type: Boolean, default: false },
      ospedalizzazione: { type: Boolean, default: false },
      pericoloVita: { type: Boolean, default: false },
      invalidita: { type: Boolean, default: false },
      anomaliaCongenita: { type: Boolean, default: false },
      altraGravita: { type: Boolean, default: false }
    },
    sintomiCategorizzati: {
      type: [String],
      default: []
    }
  },
  farmaciSospetti: {
    type: [FarmacoSchema],
    required: true
  },
  farmaciConcomitanti: {
    type: [FarmacoSchema]
  },
  segnalatore: {
    qualifica: { type: String, required: true },
    nome: { type: String },
    cognome: { type: String },
    email: { type: String },
    struttura: { type: String }
  },
  storiaClinica: {
    type: String
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'User'
  },
  localita: {
    type: {
      type: String,
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number],
      required: false
    }
  }
}, {
  timestamps: true
});

ReportSchema.index({ 'reazione.descrizione': 'text', 'farmaciSospetti.nomeCommerciale': 'text' });
ReportSchema.index({ localita: '2dsphere' });

module.exports = mongoose.model('Report', ReportSchema);
