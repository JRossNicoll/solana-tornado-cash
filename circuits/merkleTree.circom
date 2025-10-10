include "../node_modules/circomlib/circuits/mimcsponge.circom";

template MerkleTreeChecker(levels) {
    signal input leaf;
    signal input root;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    component hashers[levels];
    component mux[levels];

    signal levelHashes[levels + 1];
    levelHashes[0] <== leaf;

    for (var i = 0; i < levels; i++) {
        pathIndices[i] * (1 - pathIndices[i]) === 0;

        hashers[i] = MiMCSponge(2, 1);
        mux[i] = MultiMux1(2);

        mux[i].c[0][0] <== levelHashes[i];
        mux[i].c[0][1] <== pathElements[i];

        mux[i].c[1][0] <== pathElements[i];
        mux[i].c[1][1] <== levelHashes[i];

        mux[i].s <== pathIndices[i];
        hashers[i].ins[0] <== mux[i].out[0];
        hashers[i].ins[1] <== mux[i].out[1];
        hashers[i].k <== 0;

        levelHashes[i + 1] <== hashers[i].outs[0];
    }

    root === levelHashes[levels];
}

template MultiMux1(n) {
    signal input c[n][2];
    signal input s;
    signal output out[n];
    
    for (var i = 0; i < n; i++) {
        out[i] <== (c[i][1] - c[i][0]) * s + c[i][0];
    }
}
