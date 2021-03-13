const _ = {
    BACKEND_URL: 'http://localhost:8080',
    BASE_JSON: {"nodes":{"n1":{"x":0,"y":0,"type":"U1U2"},"n2":{"x":0,"y":21,"type":"FREE"},"n3":{"x":42,"y":-34,"type":"JOINT"},"n4":{"x":14,"y":14,"type":"U1U2"},"n5":{"x":25,"y":-50,"type":"JOINT"},"n6":{"x":25,"y":-75,"type":"JOINT"},"n7":{"x":5,"y":-95,"type":"FREE"}},"beams":{"b1":{"startNode":"n1","endNode":"n2"},"b2":{"startNode":"n2","endNode":"n3"},"b3":{"startNode":"n1","endNode":"n3"},"b4":{"startNode":"n3","endNode":"n5"},"b5":{"startNode":"n4","endNode":"n5"},"b6":{"startNode":"n5","endNode":"n6"},"b7":{"startNode":"n3","endNode":"n6"},"b8":{"startNode":"n6","endNode":"n7"},"b9":{"startNode":"n3","endNode":"n7"}},"forces":{"f1":{"magnitude":50,"angle":0,"type":"DEFINED","node":"n2"},"fx":{"angle":-30,"type":"UNKNOWN","node":"n7"}}}
}

Object.freeze(_);

export default _;