# MACOVI SPORT CLUB — Site Oficial

**Site oficial da MACOVI SPORT CLUB, clube desportivo angolano.**

Visita a página oficial: **https://bairro256.github.io/macovi-sport-clube/**

A presença digital da MACOVI apresenta informação institucional e conteúdos das suas oito modalidades:

- Xadrez
- Andebol Feminino
- Basquetebol
- Futsal Feminino
- Futsal Masculino
- Judô
- Karaté-dó
- Jiu-Jitsu

## Publicação do site

O site é publicado automaticamente a partir da branch `main` pelo workflow `.github/workflows/deploy.yml`.

- **Site oficial:** https://bairro256.github.io/macovi-sport-clube/
- **Sitemap:** https://bairro256.github.io/macovi-sport-clube/sitemap.xml
- **Robots:** https://bairro256.github.io/macovi-sport-clube/robots.txt

## Estrutura do projecto

- `index.html` — página inicial e navegação pública.
- `data/club.json` — fonte dos dados desportivos apresentados no site.
- `assets/` — imagens, estilos e recursos utilizados pelo site.
- `.github/workflows/deploy.yml` — publicação automática no GitHub Pages.

## Como actualizar os dados

1. Abrir o repositório no GitHub.
2. Entrar em `data/club.json`.
3. Carregar no lápis (**Edit this file**).
4. Actualizar os dados da modalidade e do escalão pretendidos.
5. Carregar em **Commit changes**. O GitHub Pages publica a actualização automaticamente.

É possível fazer estes passos no telemóvel através do navegador ou da aplicação GitHub.

## Estrutura dos dados

Cada modalidade contém os escalões `juvenis` (Sub-17) e `juniores` (Sub-20). Em cada escalão podem ser preenchidos:

- `plantel`: lista de atletas. Cada atleta tem `nome` e `dados`.
- `equipaTecnica`: lista com `nome` e `funcao`.
- `jogos`: lista com `data`, `hora`, `adversario`, `local`, `resultado` e `estado`.
- `classificacao`: lista com `posicao`, `equipa`, `jogos`, `vitorias`, `empates`, `derrotas` e `pontos`.

No xadrez, os campos em `dados` podem incluir título/categoria, rating FIDE, rating nacional e mesa. No andebol e futsal podem incluir número de camisola, posição, golos e jogos disputados. No basquetebol podem incluir número de camisola, posição, altura e pontos.

## Privacidade e segurança

O site é público. Não colocar números de telefone privados, moradas, documentos, datas de nascimento completas, dados médicos ou outros dados pessoais sensíveis no ficheiro público. Para atletas menores, publicar fotografias e informações pessoais apenas com autorização dos encarregados de educação e do clube.

## Custos e limites

Esta solução não cria uma base de dados paga nem um painel administrativo com autenticação. A actualização é feita pelo editor do GitHub, e os dados publicados no site são públicos. Não introduzir credenciais, palavras-passe ou chaves secretas neste repositório.

Os dados desportivos devem ser confirmados pelos responsáveis da MACOVI SPORT CLUB antes da publicação.
