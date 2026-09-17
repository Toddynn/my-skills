#!/bin/sh
set -e

# Pasta padrão onde o Nginx busca os arquivos
NGINX_ROOT=/usr/share/nginx/html
TEMPLATE=/etc/nginx/conf.d/default.conf.template
OUTPUT=/etc/nginx/conf.d/default.conf

# fallback seguro
: "${SERVER_NAME:=_}"

export SERVER_NAME

# gera o nginx.conf final
envsubst '$SERVER_NAME' < "$TEMPLATE" > "$OUTPUT"


if [ ! -f "$NGINX_ROOT/index.html" ]; then
  echo "ERRO CRÍTICO: O arquivo 'index.html' não foi encontrado em $NGINX_ROOT."
  echo "Verifique se o estágio 'builder' gerou a pasta 'dist' corretamente."
  ls -la $NGINX_ROOT
  exit 1
fi

echo "🚀 Nginx started with SERVER_NAME=$SERVER_NAME"
echo "📂 Serving files from: $NGINX_ROOT"

# Inicia o Nginx em primeiro plano (daemon off) para o Docker não fechar
exec nginx -g 'daemon off;'