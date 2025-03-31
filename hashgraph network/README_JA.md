# CapitalXchange - Muunganiko wa Mtandao wa Hedera Hashgraph

## Muhtasari
Muunganiko wa mtandao wa CapitalXchange na Hedera Hashgraph unatoa miundombinu thabiti kwa usindikaji wa data za soko la hisa na biashara kwenye mtandao wa Hedera. Safu hii ya mtandao inahakikisha operesheni salama, wazi na ufanisi kati ya Soko la Hisa la Kenya na Hedera Hashgraph.

## Vipengele vya Mtandao

### 1. Nodi ya Uthibitishaji
- Inashiriki katika makubaliano
- Inasindika miamala
- Inadumisha hali ya mtandao
- Inathibitisha vitalu

### 2. Nodi ya Jumla
- Inahifadhi data za soko la hisa
- Inashughulikia maombi ya API
- Inadumisha usawazishaji wa data
- Inatoa huduma za ufuatiliaji

## Usanikishaji wa Mtandao

### Usanikishaji wa Mazingira
```env
# Usanikishaji wa Mtandao wa Hedera
HEDERA_NETWORK=testnet
OPERATOR_ID=your_account_id
OPERATOR_KEY=your_private_key
KSE_TOPIC_ID=your_topic_id

# Usanikishaji wa Nodi
NODE_PORT=5551
NODE_ENV=development
```

### Vipengele vya Mtandao
- Usawazishaji wa data kwa wakati halisi
- Usindikaji salama wa miamala
- Ufuatiliaji wa kiotomatiki
- Uchunguzi wa afya
- Ushughulikiaji wa hitilafu

## Muundo wa Folda
```
hashgraph network/
├── validator/           # Usanikishaji wa nodi ya uthibitishaji
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── general/            # Usanikishaji wa nodi ya jumla
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── monitoring/         # Huduma za ufuatiliaji
│   ├── monitor_block_sync.js
│   └── monitor_stock_market.js
└── tests/             # Majaribio ya mtandao
    ├── __tests__/
    └── jest.config.js
```

## Maagizo ya Usanikishaji

1. **Nakili Repository**
```bash
git clone https://github.com/i-mwangi/CapitalXchange.git
cd CapitalXchange/hashgraph\ network
```

2. **Sakinisha Vitegemezi**
```bash
npm install
```

3. **Sanikisha Mazingira**
```bash
cp .env.example .env
# Hariri .env na data zako za kuingia
```

4. **Anzisha Mtandao**
```bash
# Anzisha nodi ya uthibitishaji
cd validator
npm start

# Anzisha nodi ya jumla
cd ../general
npm start
```

## Ufuatiliaji

### Ufuatiliaji wa Usawazishaji wa Vitalu
```bash
npm run monitor:block-sync
```

### Ufuatiliaji wa Soko la Hisa
```bash
npm run monitor:stock-market
```

## Majaribio

### Fanya Majaribio ya Mtandao
```bash
npm test
```

### Ufadhili wa Majaribio
```bash
npm run test:coverage
```

## Usalama

### Usalama wa Mtandao
- Nodi zote zinathibitishwa
- Miamala inasainiwa
- Data inafichwa
- Ukaguzi wa usalama wa mara kwa mara

### Udhibiti wa Ufikiaji
- Ufikiaji kulingana na jukumu
- Uthibitishaji wa API
- Kikomo cha kiwango
- Orodha ya IP nyeupe

## Matengenezo

### Uchunguzi wa Afya
- Ufuatiliaji wa hali ya nodi
- Uunganishaji wa mtandao
- Usawazishaji wa data
- Vipimo vya utendaji

### Taratibu za Backup
- Backup za hali za mara kwa mara
- Backup za usanikishaji
- Mipango ya kurejesha data

## Uwekaji

### Uwekaji wa Docker
```bash
# Jenga picha
docker-compose build

# Anzisha huduma
docker-compose up -d
```

### Uwekaji wa Mkono
1. Jenga nodi:
```bash
npm run build
```

2. Anzisha huduma:
```bash
npm start
```

## Uchunguzi wa Matatizo

### Masuala ya Kawaida
1. Usawazishaji wa Nodi
   - Chunguza uunganishaji wa mtandao
   - Thibitisha data za kuingia za Hedera
   - Fuatilia hali ya usawazishaji wa vitalu

2. Usindikaji wa Data
   - Chunguza uunganishaji wa API ya KSE
   - Thibitisha muundo wa data
   - Fuatilia logi za usindikaji

### Logi
- Logi za nodi: `logs/node.log`
- Logi za usawazishaji: `logs/sync.log`
- Logi za hitilafu: `logs/error.log`

## Ushiriki
1. Fork repository
2. Unda tawi lako la kipengele
3. Commit mabadiliko yako
4. Push kwenye tawi
5. Unda Pull Request

## Leseni
Mradi huu unalindwa na Leseni ya MIT - tazama faili ya LICENSE kwa maelezo.

## Usaidizi
Kwa usaidizi, wasiliana na:
- Barua pepe: support@capitalxchange.com
- Tovuti: https://capitalxchange.com
- GitHub Issues: https://github.com/i-mwangi/CapitalXchange/issues 
