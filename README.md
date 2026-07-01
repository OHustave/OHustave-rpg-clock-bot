# RPG Clock Bot

Bot de Discord para RPG que funciona como um **relogio de tempo ficticio**: voce define a data/hora inicial e o ritmo, e o bot conta as horas e os dias do seu mundo. Alem da data e hora, o `/relogio` mostra **dia da semana, periodo do dia (com cores que mudam), estacao e fase da lua**, tudo em embeds tematizados. Tambem gerencia **locais**, **eventos** agendados e um **calendario totalmente customizavel** (meses, dias por mes, horas por dia, dias da semana, estacoes e ciclo lunar).

## Comandos

| Comando | O que faz |
| --- | --- |
| `/relogio` | Mostra a data, hora e local ficticios atuais. |
| `/definir-data dia mes ano [hora] [minuto]` | Define a data e hora atuais. |
| `/avancar quantidade unidade` | Avanca (ou retrocede, com numero negativo) o tempo. Unidades: minutos, horas, dias. |
| `/velocidade preset [quantidade] [unidade]` | Define o ritmo em que o tempo passa sozinho (pausado, tempo real, 1min=1h, 1min=1dia ou personalizado). |
| `/pausar` | Congela o relogio (para de avancar sozinho). |
| `/local adicionar nome [descricao]` | Adiciona um local. |
| `/local editar numero [nome] [descricao]` | Edita um local. |
| `/local remover numero` | Remove um local. |
| `/local listar` | Lista todos os locais. |
| `/local atual numero` | Define o local atual. |
| `/evento adicionar nome dia mes ano [hora] [minuto]` | Agenda um evento numa data ficticia. |
| `/evento listar` | Lista os eventos (com quanto falta para cada um). |
| `/evento remover numero` | Remove um evento. |
| `/evento proximo` | Mostra o proximo evento. |
| `/calendario ver` | Mostra o calendario ficticio. |
| `/calendario meses nomes [dias]` | Define os nomes dos meses (e, opcionalmente, os dias de cada mes). |
| `/calendario dia horas` | Define quantas horas tem um dia. |
| `/calendario semana nomes` | Define os nomes dos dias da semana. |
| `/calendario estacoes nomes` | Define as estacoes do ano. |
| `/calendario lua dias` | Define a duracao do ciclo lunar (em dias). |
| `/ajuda` | Lista todos os comandos. |

## Como o relogio funciona

O bot guarda um "ponto de ancora": o tempo ficticio em um instante real. A cada consulta ele calcula
`tempo_atual = ancora + ritmo * (agora_real - instante_da_ancora)`. Assim o relogio pode:

- **passar sozinho** (defina o ritmo com `/velocidade`), ou
- **ficar parado** (`/pausar` ou ritmo pausado) e avancar so quando voce quiser (`/avancar`).

O `/relogio` deriva automaticamente o **dia da semana** (pelo dia absoluto), a **fase da lua** (pelo ciclo lunar configuravel), a **estacao** (pela fracao do ano) e o **periodo do dia** (pela fracao do dia) — todos respeitam o calendario customizado.

Cada servidor do Discord tem seu proprio relogio, calendario, locais e eventos, salvos em `data/guilds.json`.

## Configuracao

1. **Crie a aplicacao/bot** no [Discord Developer Portal](https://discord.com/developers/applications):
   - Em *Bot*, clique em *Reset Token* e copie o token.
   - Em *General Information*, copie o *Application ID*.
2. **Convide o bot** para o seu servidor (OAuth2 > URL Generator, escopos `bot` e `applications.commands`).
3. **Instale as dependencias:**
   ```bash
   npm install
   ```
4. **Configure o `.env`:** copie `.env.example` para `.env` e preencha `DISCORD_TOKEN` e `CLIENT_ID`
   (e, opcionalmente, `GUILD_ID` para registrar os comandos instantaneamente durante os testes).
5. **Registre os slash commands:**
   ```bash
   npm run deploy
   ```
6. **Inicie o bot:**
   ```bash
   npm start
   ```

## Desenvolvimento

- `npm run lint` — checagem de estilo (ESLint).
- `npm test` — testes do motor de tempo/calendario (`node --test`).
