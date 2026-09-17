#!/bin/sh
set -e

if [ ! -f dist/src/main.js ]; then
  echo "ERRO: O arquivo 'main.js' não foi encontrado em $(pwd)."
  echo "Verifique se o estágio 'runner' do Dockerfile copiou os arquivos corretamente."
  ls -la
  exit 1
fi

echo "🚀 Starting NestJS application..."

exec node dist/src/main.js