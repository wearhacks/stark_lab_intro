
 $(document).ready(function() {

  var list_editors = document.getElementsByClassName("editor");
  var editors = [];
  for(var i = 0; i<list_editors.length; i++) {
    var editor = ace.edit(list_editors[i]);
    editor.setTheme("ace/theme/tomorrow_night");
    editor.getSession().setMode("ace/mode/c_cpp");
    editor.getSession().setUseWrapMode(true);
    editors.push(editor);
  }
  $('.menu .tabitem').tab();

  $('.verify-code').on('click',function() {
    var request = {
      "files":[
        {
          "filename":"Blink Example.ino",
           "content":editors[0].getValue().trim()
        }],
      "libraries":[],
      "logging":false,
      "format":"hex",
      "version":"105",
      "build": {
        "mcu":"atmega328p",
        "f_cpu":"16000000L",
        "core":"arduino",
        "variant":"standard"}
    };
    var onSuccess = function (response) {
        if(response.success) {
          chrome.runtime.sendMessage("jbonplenmbaeemjggkkbidklebckncga",
          {"type": "connect",
           "device" : $('#devices-dropdown').val(),
           "hexfile": response.output
          },
          function(devices) {
            
          });

        }
        else {
          $('.debugger').append(parseDebuggerInfo(response.message));
          console.log(response);
        }
    };
    $.ajax({
        data: JSON.stringify(request),
        dataType: 'JSON',
        url: "http://38.108.92.130/JA3eour3J4Gehen75V8ae45G5H7Z6hz0/v1",
        type: 'POST'
    }).done(onSuccess);
    
    
  });
  var parseDebuggerInfo = function(debugString) {
    var regexp = /(<b>)(\(sketch file\))(.*?)<\/b./g
    var formatted = debugString;
    var match = regexp.exec(debugString);
    var errors = [];
    while (match != null) {
        // matched text: match[0]
        // match start: match.index
        // capturing group n: match[n]
        
        var location = match[3].split(':');
        var row = parseInt(location[1]);
        var column = parseInt(location[2]);
        var replace = '<a href="#" class="error-line" data-filename="' + location[0].trim() +
        '" data-line-num="'+location[1]+'" data-row-num="'+location[2]+'">'+match[3]+'</a>';
        formatted = formatted.replace(match[0], replace);
        match = regexp.exec(debugString);
        errors.push({
          row: row -1,
          column: column,
          text: "Compilation Error",
          type: "error" // also warning and information
        });
        
    }
    editors[0].getSession().setAnnotations(errors);
    return formatted;
  }
  $('.debugger').on('click', 'a.error-line', function() {
      console.log($(this).attr('data-filename') + " " + $(this).attr('data-line-num'));
      editors[0].gotoLine(parseInt($(this).attr('data-line-num')), $(this).attr('data-row-num'), true);
  });
  chrome.runtime.sendMessage("jbonplenmbaeemjggkkbidklebckncga", {"type": "ports"},
    function(devices) {
      $.each(devices, function(val, device) {
          $('#devices-dropdown').append( new Option(device.path,device.path) );
      });
      $('#devices-dropdown').dropdown();
  });
});