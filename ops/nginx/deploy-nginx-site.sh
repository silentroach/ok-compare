#!/bin/sh

set -eu

src=${1:?config path is required}
name=${2:?site name is required}
dst="/etc/nginx/sites-available/$name"
link="/etc/nginx/sites-enabled/$name"
dir=$(mktemp -d)
bak="$dir/$name.conf.bak"
old="$dir/$name.enabled.bak"
target="$dst"
had_dst=false
state=missing

clean() {
  rm -rf "$dir"
}

undo() {
  if [ "$had_dst" = true ]; then
    install -m 644 "$bak" "$dst"
  else
    rm -f "$dst"
  fi

  if [ "$state" = file ]; then
    install -m 644 "$old" "$link"
  elif [ "$state" = symlink ]; then
    ln -sfn "$target" "$link"
  else
    rm -f "$link"
  fi
}

trap clean EXIT

test -f "$src"

if [ -f "$dst" ]; then
  cp "$dst" "$bak"
  had_dst=true
fi

if [ -L "$link" ]; then
  state=symlink
  target=$(readlink "$link")
elif [ -f "$link" ]; then
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
