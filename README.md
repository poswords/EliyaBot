# EliyaBot

## Filter usage
`!f [condition1] [condition2] ...`

Basically all conditions are AND combined. Some conditions have OR clause in themselves.
#### Attribute / Elements
- `fire` or `f`
- `water` or `w`
- `wind` or `i`
- `thunder` or `t`
- `light` or `l`
- `dark` or `d`
#### Race
`human` `sprite` `beast` `mecha` `dragon` `undead` `youkai` `plant` `demon` `aquatic`
#### Rarity
`5*` `4*`

You can use `1234*` for not 5-star characters.
#### Power Flip Type
`fist` `sword` `bow` `support` `special`
#### Skill Wait
`sw>600` `sw<=380` `sw==460` (Mention you need to use two equal signs)
#### Gender
`male` `female` `unknown` `lily`
### Text filter
Use `-t <text to filter>` to filter by a text. If the text contains spaces, enclose it by quotes (single or double).
e.g. `-t "skill damage"`

You can add additional options before the `-t` part. Options will be applied to all `-t` part after them. You can use `reset` to clear the options.  
#### Option: Search in fields
These conditions are OR combined. If you indicate none, all fields will be searched.
- `leader` or `lb` to search in leader buff.
- `skill` or `s` to search in skill.
- `ability` or `a` to search in all abilities.
- `a12` or `a456` etc. to search in specific abilities.
- `unison` or `u` to search in skill and ability 1, 2, 4, 5, 6. 
#### Option: Negative search
Use `exclude` or `ex` condition to get results not containing the text.
#### Option: Regular expression
Use `regexp` or `r` 
