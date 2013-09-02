var formatjson=require("../lib/index.js")
var jj={
    "aa":{
        "bb":"cc",
        "dd":['1','2','3'],
        "ee":true,
        "kk":[
        {
            aaa:"aaa",
            bbbb:"bbbb"
        }
        ]
    },
    "aa2":"bb2",
    "null":null,
    "number":13123
}
console.log(formatjson(jj))