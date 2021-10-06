// Expected Test Result
/*
R1 : true
R2 : false
R4 : true
R3 : true
R5 : false
R8 : true
R6 : false
R7 : false
*/

// Source of Data - TaskData, ADO, Const, RuleData, Fx with a single parameter
// Implemented operator - AND OR NOT EQUAL LessThan GreaterThan Contains StartsWith EndsWith
var config = {
    rules:[
        {
            "ordinal": 1,
            "name":"R1",
            "type" : "composite",
            "rules":
                [
                    {
                        "ordinal": 1,
                        "name":"R1.1",
                        "type" : "binary",
                        "Lvalue" : "var1",
                        "Lsource": "TaskData",
                        "Rsource": "Const",
                        "Rvalue" : 1,
                        "op" : "eq"
                    },
                    {
                        "ordinal": 2,
                        "name":"R1.2",
                        "type" : "binary",
                        "Lvalue" : "var2",
                        "Lsource": "TaskData",
                        "Rsource": "Const",
                        "Rvalue" : 3,
                        "op" : "not"
                    }
                ],
            "op":"and"
        },
        {
            "ordinal": 2,
            "name":"R2",
            "type" : "binary",
            "Lvalue" : "status",
            "Rvalue" : "Error",
            "Lsource": "TaskData",
            "Rsource": "Const",
            "op" : "eq"
        },
        {
            "ordinal": 6,
            "name":"R3",
            "type" : "binary",
            "Lvalue" : "desc",
            "Rvalue" : "very",
            "Lsource": "TaskData",
            "Rsource": "Const",
            "op" : "contains"
        },
        {
            "ordinal": 5,
            "name":"R4",
            "type" : "binary",
            "Lvalue" : "var2",
            "Rvalue" : 3,
            "Lsource": "TaskData",
            "Rsource": "Const",
            "op" : "lt"
        },
        {
            "ordinal": 4,
            "name":"R7",
            "type" : "binary",
            "Lvalue" : "R5",
            "Rvalue" : false,
            "Lsource": "RuleData",
            "Rsource": "Const",
            "op" : "eq"
        },
        {
            "ordinal": 3,
            "name":"R6",
            "type" : "binary",
            "Lvalue" : "R5",
            "Rvalue" : true,
            "Lsource": "RuleData",
            "Rsource": "Const",
            "op" : "eq"
        },
        {
            "ordinal": 7,
            "name":"R5",
            "type" : "binary",
            "Lvalue" : "isEnabled",
            "Rvalue" : true,
            "Lsource": "TaskData",
            "Rsource": "Const",
            "op" : "eq"
        },
        {
            "ordinal": 8,
            "name":"R8",
            "type" : "binary",
            "Lvalue" : "desc",
            "Rvalue" : "sentence",
            "Lsource": "TaskData",
            "Rsource": "Const",
            "op" : "endsWith"
        }
    ]
}

var ob = {
    "var1":1,
    "var2":2,
    "status": "ok",
    "desc" : "This is a very long sentence",
    "isEnabled" : false,
    "TaskType" : "Bug"
}

function isRuleDataDependent(r)
{
    if (r.type == "Composite")
    {
        var isTrue = false;
        for(var i in r.rules)
        {
            isTrue = isTrue || isRuleDataDependent(r.rules[i]);
        }

        return isTrue;
    }
    else
    {
        if (r.Rsource == "RuleData" || r.Lsource == "RuleData")
        {
            return true;
        }
    }

    return false;
}

function compare(r1, r2)
{
    if (r1.type == "composite")
    {
        r1.rules.sort(compare);
    }
    if (r2.type == "composite")
    {
        r2.rules.sort(compare);
    }

    var isDepRule1 = isRuleDataDependent(r1);
    var isDepRule2 = isRuleDataDependent(r2);
    if (isDepRule1 && isDepRule2)
    {
        return (r1.ordinal - r2.ordinal);
    }

    if (isDepRule1)
    {
        return 1;
    }
    if (isDepRule2)
    {
        return -1;
    }
    
    return (r1.ordinal - r2.ordinal);
}

function InitRules()
{
    config.rules.sort(compare);
}

function RunRuleEngine(config, obj)
{
    var results = {};
    for (var i = 0; i < config.rules.length; i++)
    {
        var rule = config.rules[i];

        if (isRuleDataDependent(rule))
        {
            if (rule.Lsource == "RuleData")
            {
                rule.Lvalue = results[rule.Lvalue];
            }
            if (rule.Rsource == "RuleData")
            {
                rule.Rvalue = results[rule.Rvalue];
            }
        }

        if (rule.type == "binary")
        {
            // ToDo - Handle - ADO also,  Don't handle RuleResults (Already handled)
            // Get LValue
            var Lvalue, Rvalue;
            if (rule.Lsource == "TaskData")
            {
                Lvalue = obj[rule.Lvalue];
            }
            else if (rule.Lsource == "ADO")
            {
                Lvalue = obj[rule.Lvalue];
            }
            else if (rule.Lsource == "Fx")
            {
                Lvalue = rule.func(obj[rule.Lvalue]);
            }
            else if (rule.Lsource == "Const")
            {
                Lvalue = rule.Lvalue;
            }

            // Get RValue
            if (rule.Rsource == "TaskData")
            {
                Rvalue = obj[rule.Rvalue];
            }
            else if (rule.Rsource == "ADO")
            {
                Rvalue = obj[rule.Rvalue];
            }
            else if (rule.Lsource == "Fx")
            {
                Rvalue = rule.func(obj[rule.Rvalue]);
            }
            else if (rule.Rsource == "Const")
            {
                Rvalue = rule.Rvalue;
            }

            if (rule.op === "eq")
            {
                if (Lvalue == Rvalue)
                {
                    results[rule.name] = true;
                }
                else
                {
                    results[rule.name] = false;
                }
            }
            else if (rule.op === "not")
            {
                if (Lvalue != Rvalue)
                {
                    results[rule.name] = true;
                }
                else
                {
                    results[rule.name] = false;
                }
            }
            else if (rule.op === "lt")
            {
                if (Lvalue < Rvalue)
                {
                    results[rule.name] = true;
                }
                else
                {
                    results[rule.name] = false;
                }
            }
            else if (rule.op === "gt")
            {
                if (Lvalue > Rvalue)
                {
                    results[rule.name] = true;
                }
                else
                {
                    results[rule.name] = false;
                }
            }
            else if (rule.op === "lte")
            {
                if (Lvalue <= Rvalue)
                {
                    results[rule.name] = true;
                }
                else
                {
                    results[rule.name] = false;
                }
            }
            else if (rule.op === "gte")
            {
                if (Lvalue >= Rvalue)
                {
                    results[rule.name] = true;
                }
                else
                {
                    results[rule.name] = false;
                }
            }
            else if (rule.op === "contains")
            {
                if (Lvalue.indexOf(Rvalue) >= 0)
                {
                    results[rule.name] = true;
                }
                else
                {
                    results[rule.name] = false;
                }
            }
            else if (rule.op === "startsWith")
            {
                if (Lvalue.indexOf(Rvalue) == 0)
                {
                    results[rule.name] = true;
                }
                else
                {
                    results[rule.name] = false;
                }
            }
            else if (rule.op === "endsWith")
            {
                var len = Rvalue.length;
                if (Lvalue.indexOf(Rvalue) == Lvalue.length - len)
                {
                    results[rule.name] = true;
                }
                else
                {
                    results[rule.name] = false;
                }
            }
        }
        else if (rule.type == "composite")
        {
            var comp_results = RunRuleEngine(rule, ob);
            if (rule.op === "and")
            {
                results[rule.name] = true;
                for (var x in comp_results)
                {
                    if (comp_results[x] == false)
                    {
                        results[rule.name] = false;
                    }
                };
            }
            if (rule.op === "or")
            {
                results[rule.name] = false;
                for (var x in comp_results)
                {
                    if (comp_results[x] == true)
                    {
                        results[rule.name] = true;
                    }
                };
            }
        }
    }

    return results;
}

function Run()
{
    InitRules();
    debugger;
    var results = RunRuleEngine(config, ob);
    var result = "";
    for (var i  in results)
    {
        result += i + " : " + results[i] + "\r\n";
    }

    var el = document.getElementById("text");
    el.value = result;
}

Run();

/*
3. ADOData needs to be cached


6. Error detection and reporting
*/