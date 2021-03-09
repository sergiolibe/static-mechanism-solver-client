<?php
$env_variables = getenv();


$PROD_URL = $env_variables['PROD_URL'];

?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Static Mechanism Solver</title>
</head>
<body>
<h4>
    Static Mechanism Solver
</h4>

<h3>
    <button onclick="canvas.zoomIn()">+ZOOM</button>
    <button onclick="canvas.zoomOut()">-ZOOM</button>
    <button onclick="canvas.moveInX(10)">></button>
    <button onclick="canvas.moveInX(-10)"><</button>
    <button onclick="canvas.moveInY(10)">^</button>
    <button onclick="canvas.moveInY(-10)">V</button>
</h3>

<div style="display: inline-flex;">
    <div id="jsoneditor" style="width: 45vw; height: 80vh;"></div>
    <div style="width: 45vw; height: 45vw;border: 1px solid black;">
        <canvas id="canvas"></canvas>
    </div>

    <!--    <a href="" style="color: darkred"></a>-->
</div>

</body>

<link href="https://cdn.jsdelivr.net/npm/jsoneditor@9.1.9/dist/jsoneditor.min.css" rel="stylesheet" type="text/css">
<script src="https://cdn.jsdelivr.net/npm/jsoneditor@9.1.9/dist/jsoneditor.min.js"></script>
<script src="/js/app.js?<?php echo date('YmdHis'); ?>"></script>
<script src="/js/classes.js?<?php echo date('YmdHis'); ?>"></script>
<script src="/js/canvas.js?<?php echo date('YmdHis'); ?>"></script>
<script>
    let jsonContainer = document.getElementById("jsoneditor");
    let systemJsonData = <?php echo file_get_contents(__DIR__ . '/system_data.json'); ?>;


    // setTimeout(function(){location.reload();},1000);

    let prod_url = '<?php echo $PROD_URL; ?>';

    let backendCommunicator = new BackendCommunicator(prod_url);

    let canvas = new Canvas('canvas');

    let staticSystem = new StaticSystem(systemJsonData);


    canvas.drawSystem(staticSystem);
    backendCommunicator.submitSystem(systemJsonData).then(response => {
        // console.log(response);
        canvas.drawReactions(response.list_of_reactions);
    });
    let options = {
        mode: 'code',
        onChangeJSON: function (json) {
            staticSystem = new StaticSystem(json);
            canvas.drawSystem(staticSystem);
            backendCommunicator.submitSystem(json).then(response => {
                canvas.drawReactions(response.list_of_reactions);
            });
        },
        onChangeText: function (jsonString) {
            let json = JSON.parse(jsonString);
            staticSystem = new StaticSystem(json);
            canvas.drawSystem(staticSystem);
            backendCommunicator.submitSystem(json).then(response => {
                canvas.drawReactions(response.list_of_reactions);
            });
        }
    };

    let editor = new JSONEditor(jsonContainer, options);

    editor.set(systemJsonData);
    // editor.expandAll();
</script>
</html>
