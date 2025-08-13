
export const pathArray =
{
    red: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9',
        'r10', 'r11', 'r12', 'r13', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9',
        'g10', 'g11', 'g12', 'g13', 'y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8', 'y9',
        'y10', 'y11', 'y12', 'y13', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9',
        'b10', 'b11', 'b12', 'rh1', 'rh2', 'rh3', 'rh4', 'rh5', 'home'],

    blue: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10', 'b11', 'b12', 'b13', 'r1',
        'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10', 'r11', 'r12', 'r13',
        'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11', 'g12', 'g13',
        'y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8', 'y9', 'y10', 'y11', 'y12',
        'bh1', 'bh2', 'bh3', 'bh4',
        'bh5', 'home'
    ],
    green: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11', 'g12', 'g13',
        'y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8', 'y9', 'y10', 'y11', 'y12', 'y13',
        'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10', 'b11', 'b12', 'b13', 'r1',
        'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10', 'r11', 'r12', 'gh1', 'gh2', 'gh3', 'gh4',
        'gh5', 'home']
    ,
    yellow: ['y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8', 'y9', 'y10', 'y11', 'y12', 'y13',
        'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10', 'b11', 'b12', 'b13','r1',
        'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10', 'r11', 'r12', 'r13',
        'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11', 'g12', 'yh5', 'yh4', 'yh3', 'yh2',
        'yh1', 'home'
    ]
}

export const homePathEntries = {
    blue: ['bh1', 'bh2', 'bh3', 'bh4', 'bh5', 'home'],
    green: ['gh1', 'gh2', 'gh3', 'gh4', 'gh5', 'home'],
    yellow: ['yh1', 'yh2', 'yh3', 'yh4', 'yh5', 'home'],
    red: ['rh1', 'rh2', 'rh3', 'rh4', 'rh5', 'home']
}

export const safePaths = [
    'r1', 'r9', 'b1', 'b9', 'g1', 'g9', 'y1', 'y9',
    ...homePathEntries.blue,
    ...homePathEntries.red,
    ...homePathEntries.yellow,
    ...homePathEntries.green
];


export const boarddetails = {
  red:    { boardColor: 'red',    homePathEntry: 'b12', gameEntry: 'r1' },
  blue:   { boardColor: 'blue',   homePathEntry: 'y12', gameEntry: 'b1' },
  green:  { boardColor: 'green',  homePathEntry: 'r12', gameEntry: 'g1' },
  yellow: { boardColor: 'yellow', homePathEntry: 'g12', gameEntry: 'y1' }
};