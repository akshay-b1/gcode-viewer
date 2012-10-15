///////////////////////////////////////////////////////////////////////////////



// gcodeFile = new GCodeFile();

// gcodeFile.codes // doesn't include comments
// gcodeFile.codesWithComments // includes comments
// gcodeFile.layers // grouped by z axis (array of z values each with array of xy)
// gcodeFile.bounds // [minX, maxX, minY, maxY, minZ, maxZ]
// gcodeFile.plane  // "XY", "XZ", "YZ", undefined (defined if codes contain G17-19)
// gcodeFile.units  // "mm", "in" (assuming no changes midfile)
// gcodeFile.extrusion // true if codes contain M101-108 or G1 E

// gcodeFile.codes.forEach(function(gcode) {
//   gcode.raw // returns the raw line of gcode text used to generate
//   gcode.code // G0, G1, M3, etc
//   gcode.params // { X:-3.141, Y:'[8*4]', Z:'#42', A:'acos[0]' }, undefined
//   gcode.coordinates // undefined (use current), absolute, relative

//   if(gcode.params['Z'] != undefined) {
//     gcodeFile.layers[gcode['Z']] = gcode;
//   }
// });



// renderer = new GCodeRenderer();
// renderer.render(gcodeFile)



///////////////////////////////////////////////////////////////////////////////

// gcode_file = IO
// gcode_model = new GCodeCollection();
//
// gcode_model = (new GcodeParser()).parse(gcode_file)
// renderer = (new GcodeRenderer(webgl_context))

var config = {
  lastImportedKey: 'last-imported',
  notFirstVisitKey: 'not-first-visit',
  defaultFilePath: 'examples/octocat.gcode'
}


var scene = null,
    object = null,
    effectController;

function about() {
  $('#aboutModal').modal();
}

function openDialog() {
  $('#openModal').modal();
}


var gp, gm, gi, gr;

function onGCodeLoaded(gcode) {
      gp = new GCodeParser();
      gm = gp.parse(gcode);
      // gi = new GCodeInterpreter();
      // gi.interpret(gm);
      gr = new GCodeRenderer();
      var gcodeObj = gr.render(gm);


  // var gcodeObj = createObjectFromGCode(gcode);

  // // var gcodeModel = OldGCodeParser.parse(gcode);

  // localStorage.removeItem(config.lastImportedKey);
  // try {
  //   localStorage.setItem(config.lastImportedKey, gcode);
  // }
  // catch(e) {
  //   // localstorage error - probably out of space
  // }

  $('#openModal').modal('hide');
  if (object) {
    scene.remove(object);
  }



  object = gcodeObj;

  scene.add(object);
}

$(function() {

  // if (!Modernizr.webgl) {
  //   alert("Sorry, you need a WebGL capable browser to use this.\n\nGet the latest Chrome or FireFox.");
  //   return;
  // }

  if (!Modernizr.localstorage) {
    alert("This app uses local storage to save settings, but your browser doesn't support it.\n\nGet the latest Chrome or FireFox.");
    return;
  }

  // Show 'About' dialog for first time visits.
  if (!localStorage.getItem(config.notFirstVisitKey)) {
    localStorage.setItem(config.notFirstVisitKey, true);
    setTimeout(about, 500);
  }

  $('.gcode_examples a').on('click', function(event) {
    GCodeImporter.importPath($(this).attr('href'), onGCodeLoaded);
    return false;
  })

  // Drop files from desktop onto main page to import them.
  $('body').on('dragover', function(event) {

    event.stopPropagation();
    event.preventDefault();
    event.originalEvent.dataTransfer.dropEffect = 'copy';

  }).on('drop', function(event) {

    event.stopPropagation();
    event.preventDefault();

    FileIO.load(event.originalEvent.dataTransfer.files, function(gcode) {
      GCodeImporter.importText(gcode, onGCodeLoaded);
    });

  });

  scene = createScene($('#renderArea')[0]);

  var lastImported = localStorage.getItem(config.lastImportedKey);
  if (lastImported) {
    GCodeImporter.importText(lastImported, onGCodeLoaded);
  } else {
    GCodeImporter.importPath(config.defaultFilePath, onGCodeLoaded);
  }

    setupGui();
});


function setupGui() {

    var createHandler = function( id ) {

    };

    function toggle( e ) {

      if ( e.style.display === "block" ) {

        e.style.display = "none";

      } else {

        e.style.display = "block";

      }

    }

    effectController = {

      gcodeIndex:   10,

      h_s:  function() {
        for (var i = 0; i < g_s.length; i++)  toggle(g_s[ i ].domElement);
      },
      dummy: function() {
      }

    };

    var e1, h,
    g_m = [], g_c, g_pc, g_do, g_s, g_r, mm,
    gui = new DAT.GUI();

    h = gui.add(effectController, "h_s").name("Properties");
    e1 = gui.add(effectController, "gcodeIndex", 1, 50000, 1);

    g_s = [ e1 ];

    setGuiHeaderStyle(h, 200, 65, 50);
    setGuiElementStyle(g_s, 200, 65, 50, "block");

    gui.domElement.style.backgroundColor = "#222";

  }


  function setGuiHeaderStyle( g, h, s, v ) {

    var color = "hsl(" + h + "," + s + "%, " + v + "%)";

    g.domElement.style.borderLeft = "solid 5px " + color;
    g.domElement.style.background = color;
    g.domElement.style.fontWeight = "bold";

  }

  function setGuiElementStyle( a, h, s, v, display ) {

    var s, color = "hsl(" + h + "," + s + "%, " + v + "%)";

    for ( i = 0; i < a.length; i ++ ) {

      s = a[ i ].domElement.style;
      s.borderLeft = "solid 5px " + color;
      s.display = display ? display : "none";

    }

  }

