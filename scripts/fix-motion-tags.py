import pathlib
import sys

CLOSE_BAD = "</" + "motion" + ">"
CLOSE_GOOD = "</" + "div" + ">"

for path in sys.argv[1:]:
    p = pathlib.Path(path)
    t = p.read_text(encoding="utf-8")
    t = t.replace("<motion", "<div")
    t = t.replace(CLOSE_BAD, CLOSE_GOOD)
    p.write_text(t, encoding="utf-8")
    print("fixed", path)
