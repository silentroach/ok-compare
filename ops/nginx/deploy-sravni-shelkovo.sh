#!/bin/sh

set -eu

src=${1:?config path is required}
dst=/etc/nginx/sites-available/sravni-shelkovo
link=/etc/nginx/sites-enabled/sravni-shelkovo
dir=$(mktemp -d)
bak="$dir/sravni-shelkovo.conf.bak"
old="$dir/sravni-shelkovo.conf.enabled.bak"
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
