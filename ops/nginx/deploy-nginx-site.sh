#!/bin/sh

set -eu

src=${1:?config path is required}
name=${2:?site name is required}
dst="/etc/nginx/sites-available/$name"
link="/etc/nginx/sites-enabled/$name"
dir=$(mktemp -d)
bak="$dir/$name.conf.bak"
old="$dir/$name.enabled.bak"
state=symlink

clean() {
  rm -rf "$dir"
}

undo() {
  install -m 644 "$bak" "$dst"

  if [ "$state" = file ]; then
    install -m 644 "$old" "$link"
  else
    ln -sfn "$dst" "$link"
  fi
}

trap clean EXIT

test -f "$src"
cp "$dst" "$bak"

if [ ! -L "$link" ]; then
  state=file
  cp "$link" "$old"
fi

install -m 644 "$src" "$dst"
ln -sfn "$dst" "$link"

if ! nginx -t; then
  undo
  nginx -t
  exit 1
fi

systemctl reload nginx
systemctl is-active --quiet nginx
