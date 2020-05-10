#!/usr/bin/make -f

all: build/DnDBtoDiscord.js

build/DnDBtoDiscord.js: TampermonkeyHeader.js DnDBtoDiscord.js
		cat TampermonkeyHeader.js DnDBtoDiscord.js | sed -e '/@require.*DnDBtoDiscord.js/d' > build/DnDBtoDiscord.js
