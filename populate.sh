#!/bin/bash

TOKEN="XXXXXXXXXXXXXXXXXXX"
BASE_URL="http://localhost:5000/api"
NUMERO_SEGNALAZIONI=100


FARMACI=(
    "Tachipirina" "Moment" "Brufen" "Cardioaspirin" "Eutirox" "Xanax"
    "Toradol" "Lansoprazolo" "Metformina" "Augmentin" "Creon" "Eliquis"
    "Gaviscon" "Pantoprazolo" "Lixiana" "Ozempic" "Depakin" "Sinvastatina"
    "Ramipril" "Bisoprololo" "Ventolin" "Fluimucil" "Levotuss" "Enterogermina"
)
SINTOMI=(
    "mal di testa" "rash cutaneo" "nausea" "vomito" "dolore allo stomaco"
    "vertigini" "insonnia" "sonnolenza" "prurito intenso" "tachicardia"
    "edema alle caviglie" "secchezza delle fauci" "costipazione" "diarrea"
    "affaticamento" "mialgia" "artralgia" "visione offuscata" "ronzio nelle orecchie"
)
SESSO=("M" "F")
TIPO_SEGNALAZIONE=("Cittadino" "Sanitario")
ESITO_REAZIONE=("Guarigione completa" "In via di guarigione" "Guarigione con postumi" "Persistenza della reazione" "Sconosciuto")
QUALIFICA_SEGNALATORE=("Cittadino" "Medico" "Farmacista" "Infermiere")
STORIA_CLINICA=("Paziente con ipertensione pregressa." "Nessuna patologia di rilievo." "Paziente diabetico di tipo 2." "Soggetto allergico alle penicilline.")
DOSAGGI=("500 mg" "1 compressa al giorno" "10 ml due volte al giorno" "20 gocce" "1 fiala intramuscolo" "1 bustina prima dei pasti")
VIE_SOMMINISTRAZIONE=("Orale" "Endovenosa" "Intramuscolare" "Topica" "Sublinguale" "Cutanea")

BOUNDING_BOXES=(
  "44.5 46.5 7.0 13.5"
  "41.5 44.4 11.0 15.5"
  "38.0 41.4 13.5 18.0"
  "36.5 38.0 12.5 15.5"
  "39.0 41.0 8.5 9.5"
)

function random_float() {
  local min=$1
  local max=$2
  echo "scale=4; $min + ($max - $min) * ($RANDOM / 32767)" | bc
}

echo "Inizio la creazione di $NUMERO_SEGNALAZIONI segnalazioni complete..."

for i in $(seq 1 $NUMERO_SEGNALAZIONI)
do
  RANDOM_FARMACO=${FARMACI[$RANDOM % ${#FARMACI[@]}]}
  RANDOM_ETA=$((RANDOM % 75 + 18))
  RANDOM_SESSO=${SESSO[$RANDOM % ${#SESSO[@]}]}
  RANDOM_SINTOMO=${SINTOMI[$RANDOM % ${#SINTOMI[@]}]}
  RANDOM_DESCRIZIONE="Paziente riporta $RANDOM_SINTOMO."
  RANDOM_PESO=$((RANDOM % 60 + 50))
  RANDOM_ALTEZZA=$((RANDOM % 50 + 150))
  ALPHABET=({A..Z})
  RANDOM_INIZIALI="${ALPHABET[$RANDOM % 26]}${ALPHABET[$RANDOM % 26]}"

  RANDOM_DAYS_AGO_REACTION=$((RANDOM % 365 + 1))
  RANDOM_DATA_INIZIO_REAZIONE=$(date -u -d "$RANDOM_DAYS_AGO_REACTION days ago" +"%Y-%m-%d")
  RANDOM_REACTION_DURATION=$((RANDOM % 10 + 1))
  RANDOM_DATA_FINE_REAZIONE=$(date -u -d "$RANDOM_DATA_INIZIO_REAZIONE + $RANDOM_REACTION_DURATION days" +"%Y-%m-%d")

  RANDOM_DAYS_AGO_TERAPIA=$(($RANDOM_DAYS_AGO_REACTION + 15))
  RANDOM_DATA_INIZIO_TERAPIA=$(date -u -d "$RANDOM_DAYS_AGO_TERAPIA days ago" +"%Y-%m-%d")
  RANDOM_TERAPIA_DURATION=$((RANDOM % 30 + 10))
  RANDOM_DATA_FINE_TERAPIA=$(date -u -d "$RANDOM_DATA_INIZIO_TERAPIA + $RANDOM_TERAPIA_DURATION days" +"%Y-%m-%d")

  RANDOM_TIPO=${TIPO_SEGNALAZIONE[$RANDOM % ${#TIPO_SEGNALAZIONE[@]}]}
  RANDOM_ESITO=${ESITO_REAZIONE[$RANDOM % ${#ESITO_REAZIONE[@]}]}
  RANDOM_QUALIFICA=${QUALIFICA_SEGNALATORE[$RANDOM % ${#QUALIFICA_SEGNALATORE[@]}]}
  RANDOM_STORIA=${STORIA_CLINICA[$RANDOM % ${#STORIA_CLINICA[@]}]}
  RANDOM_DOSAGGIO=${DOSAGGI[$RANDOM % ${#DOSAGGI[@]}]}
  RANDOM_VIA=${VIE_SOMMINISTRAZIONE[$RANDOM % ${#VIE_SOMMINISTRAZIONE[@]}]}

  IS_GRAVE="false"
  OSPEDALIZZAZIONE="false"
  PERICOLO_VITA="false"
  if (( RANDOM % 4 == 0 )); then
      IS_GRAVE="true"
      if (( RANDOM % 2 == 0 )); then
        OSPEDALIZZAZIONE="true"
      else
        PERICOLO_VITA="true"
      fi
  fi

  FARMACI_CONCOMITANTI_JSON=""
  if (( RANDOM % 3 == 0 )); then
    RANDOM_CONCOMITANTE=${FARMACI[$RANDOM % ${#FARMACI[@]}]}
    FARMACI_CONCOMITANTI_JSON=$(cat <<EOM
    ,{
      "nomeCommerciale": "$RANDOM_CONCOMITANTE",
      "indicazioneUso": "Terapia concomitante"
    }
EOM
)
  fi

  RANDOM_BOX_INDEX=$((RANDOM % ${#BOUNDING_BOXES[@]}))
  SELECTED_BOX=(${BOUNDING_BOXES[$RANDOM_BOX_INDEX]})

  LAT_MIN=${SELECTED_BOX[0]}
  LAT_MAX=${SELECTED_BOX[1]}
  LON_MIN=${SELECTED_BOX[2]}
  LON_MAX=${SELECTED_BOX[3]}

  RANDOM_LAT=$(random_float $LAT_MIN $LAT_MAX)
  RANDOM_LON=$(random_float $LON_MIN $LON_MAX)

  JSON_PAYLOAD=$(cat <<EOF
{
  "tipoSegnalazione": "$RANDOM_TIPO",
  "paziente": {
    "iniziali": "$RANDOM_INIZIALI",
    "eta": $RANDOM_ETA,
    "sesso": "$RANDOM_SESSO",
    "peso": $RANDOM_PESO,
    "altezza": $RANDOM_ALTEZZA
  },
  "reazione": {
    "descrizione": "$RANDOM_DESCRIZIONE",
    "dataInizio": "$RANDOM_DATA_INIZIO_REAZIONE",
    "dataFine": "$RANDOM_DATA_FINE_REAZIONE",
    "esito": "$RANDOM_ESITO",
    "gravita": {
      "isGrave": $IS_GRAVE,
      "ospedalizzazione": $OSPEDALIZZAZIONE,
      "pericoloVita": $PERICOLO_VITA
    }
  },
  "farmaciSospetti": [
    {
      "nomeCommerciale": "$RANDOM_FARMACO",
      "principioAttivo": "Principio di $RANDOM_FARMACO",
      "lotto": "Lotto casuale $i",
      "dosaggio": "$RANDOM_DOSAGGIO",
      "viaSomministrazione": "$RANDOM_VIA",
      "dataInizioTerapia": "$RANDOM_DATA_INIZIO_TERAPIA",
      "dataFineTerapia": "$RANDOM_DATA_FINE_TERAPIA",
      "indicazioneUso": "Indicazione per $RANDOM_FARMACO"
    }
  ],
  "farmaciConcomitanti": [],
  "segnalatore": {
    "qualifica": "$RANDOM_QUALIFICA",
    "nome": "Segnalatore",
    "cognome": "$i",
    "email": "segnalatore$i@test.com",
    "struttura": "ASL Test"
  },
  "storiaClinica": "$RANDOM_STORIA",
  "localita": {
    "type": "Point",
    "coordinates": [$RANDOM_LON, $RANDOM_LAT]
  }
}
EOF
)
  echo "Inserisco la segnalazione N.$i..."

  curl --location --request POST "$BASE_URL/reports" \
  --header "Authorization: Bearer $TOKEN" \
  --header "Content-Type: application/json" \
  --data "$JSON_PAYLOAD" \
  --silent \
  --output /dev/null

  sleep 0.1
done

echo ""
echo "Finito! $NUMERO_SEGNALAZIONI segnalazioni sono state create."
