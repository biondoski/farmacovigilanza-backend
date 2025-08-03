#!/bin/bash

TOKEN=""

BASE_URL="http://localhost:5000/api"

NUMERO_SEGNALAZIONI=100

FARMACI=("Aspirina" "Tachipirina" "Moment" "Brufen" "Cardioaspirin" "Eutirox" "Xanax" "Toradol")
DESCRIZIONI_INIZIO=("Leggero" "Forte" "Improvviso" "Persistente" "Lieve ma fastidioso")
SINTOMI=("mal di testa" "rash cutaneo" "senso di nausea" "dolore allo stomaco" "vertigini" "insonnia" "prurito intenso")
GRAVITA=("Lieve" "Moderata" "Grave")
SESSO=("M" "F" "Altro")

BOUNDING_BOXES=(
  "44.5 46.5 7.0 13.5"   # Nord Italia
  "41.5 44.4 11.0 15.5"  # Centro Italia
  "38.0 41.4 13.5 18.0"  # Sud Italia
  "36.5 38.0 12.5 15.5"  # Sicilia
  "39.0 41.0 8.5 9.5"    # Sardegna
)


function random_float() {
  local min=$1
  local max=$2
  echo "scale=4; $min + ($max - $min) * ($RANDOM / 32767)" | bc
}


echo "Inizio la creazione di $NUMERO_SEGNALAZIONI segnalazioni geograficamente accurate..."

for i in $(seq 1 $NUMERO_SEGNALAZIONI)
do
  RANDOM_FARMACo=${FARMACI[$RANDOM % ${#FARMACI[@]}]}
  RANDOM_ETA=$((RANDOM % 70 + 18))
  RANDOM_SESSO=${SESSO[$RANDOM % ${#SESSO[@]}]}
  RANDOM_DESC_INIZIO=${DESCRIZIONI_INIZIO[$RANDOM % ${#DESCRIZIONI_INIZIO[@]}]}
  RANDOM_SINTOMO=${SINTOMI[$RANDOM % ${#SINTOMI[@]}]}
  RANDOM_DESCRIZIONE="$RANDOM_DESC_INIZIO $RANDOM_SINTOMO."
  RANDOM_GRAVITA=${GRAVITA[$RANDOM % ${#GRAVITA[@]}]}

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
  "farmaco": {
    "nomeCommerciale": "$RANDOM_FARMACo",
    "principioAttivo": "Principio di $RANDOM_FARMACo",
    "lotto": "Lotto casuale $i"
  },
  "paziente": {
    "eta": $RANDOM_ETA,
    "sesso": "$RANDOM_SESSO"
  },
  "reazione": {
    "descrizione": "$RANDOM_DESCRIZIONE",
    "gravita": "$RANDOM_GRAVITA"
  },
  "localita": {
    "type": "Point",
    "coordinates": [$RANDOM_LON, $RANDOM_LAT]
  }
}
EOF
)
  echo "Inserisco la segnalazione N.$i: ($RANDOM_LAT, $RANDOM_LON)..."

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
