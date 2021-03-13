<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Static Mechanism Solver</title>

    <link rel="stylesheet" href="css/app.css">
    <link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.13.0/css/all.css">
</head>
<body>
<h4>
    Static Mechanism Solver
</h4>

<h5>
    Place the mouse inside the canvas and use:
    c: <i class="purple fa fa-crosshairs"></i>,
    i: <i class="purple fa fa-search-plus"></i>,
    o: <i class="purple fa fa-search-minus"></i>,
    <i class="blue fa fa-arrow-left"></i>,
    <i class="blue fa fa-arrow-up"></i>,
    <i class="blue fa fa-arrow-right"></i>,
    <i class="blue fa fa-arrow-down"></i>,
    p: <i class="green fa fa-print"></i>
</h5>

<div style="display: inline-flex;">
    <div id="jsoneditor" style="width: 45vw; height: 80vh;"></div>
    <div style="width: 45vw; height: 45vw;border: 1px solid black;position:relative">
        <canvas id="background-canvas" style="position:absolute;left:0;top:0;z-index:0;"></canvas>
        <canvas id="static-canvas" style="position:absolute;left:0;top:0;z-index:1;"></canvas>
        <canvas id="dynamic-canvas" style="position:absolute;left:0;top:0;z-index:2;"></canvas>
    </div>

    <!--    <a href="" style="color: darkred"></a>-->
</div>

</body>

<link href="https://cdn.jsdelivr.net/npm/jsoneditor@9.1.9/dist/jsoneditor.min.css" rel="stylesheet" type="text/css">
<script src="https://cdn.jsdelivr.net/npm/jsoneditor@9.1.9/dist/jsoneditor.min.js"></script>
<script type="module" src="js/index.js?<?php echo date('YmdHis'); ?>"></script>

</html>
