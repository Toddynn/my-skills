#!/bin/sh
set -e

if [ ! -f server.js ]; then
  echo "ERRO: O arquivo 'server.js' não foi encontrado em $(pwd)."
  echo "Verifique se o estágio 'runner' do Dockerfile copiou os arquivos corretamente."
  ls -la
  exit 1
fi

echo "🚀 Starting Next.js application in Standalone mode..."

exec node server.js