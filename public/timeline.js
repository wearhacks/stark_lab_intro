function Timeline(steps) {
    var self = this;

    var current = 0;
    var inactiveColor = "#A6A6A6";
    var radius = 7; // set the radius of the circle
    var circumference = 2 * radius * Math.PI; 
    var seperation = 40;
    var startingPointX = 20;
    var startingPointY = 20;
    var stroke = 5;
    var circleFill = "#02BAD8";
    var totalSteps = Object.keys(steps).length;
    var s = Snap("#timeline");
    var groups = {}
    var line = null;
    self.nextStep = function() {
        console.log("next step");
        var curr = groups[current];
        var next = groups[current + 1];
        var remaining = totalSteps - current - 1;
        curr.select("circle.progress").animate({strokeWidth:0},400);
        curr.select("path.checkmark").animate({strokeDashoffset:0},300);
        
          curr.select("text").animate({fill:inactiveColor},300);
        setTimeout(function(){
          line.animate({strokeDashoffset:remaining*seperation},300);
        }, 300);
        next.select("circle.override").animate({fillOpacity:1},300);
        next.select("text").animate({fill:"white"},300);
        setTimeout(function(){
          next.select("circle.progress").animate({strokeDashoffset:0}, 500)
        }, 600);
        current++;
    };


    self.createStep  = function(step, stepText, completed) {
        var c2 = s.circle(radius+ stroke, radius+ stroke, radius)
        .addClass("progress")
        .attr({
            stroke: "white",
            strokeWidth: stroke,
            strokeDasharray: current === step ? 0:circumference,
            strokeDashoffset: current === step ? 0:circumference,
            transform: 'rotate(270deg)',
            fillOpacity:0
        });

        var c3 = s.circle(radius+ stroke, radius+ stroke, radius)
        .addClass("override")
        .attr({
            transform: 'rotate(270deg)',
            fill:circleFill, 
            fillOpacity: completed || (current === step) ? 1: 0.3,
        });

        // this draws a rectangular shape equivalent to "M10,20h40v50h-40z"
        var checkmark = s.path("M14.1 27.2l7.1 7.2 16.7-16.8")
        .addClass("checkmark")
        .attr({
            stroke:"white",
            strokeWidth:stroke,
            fillOpacity:0,
            strokeDasharray:(completed )? 0:35,
            strokeDashoffset:(completed )? 0:35,
            transform: "translate(1, -2) scale(0.5)"
        });
        var text = s.text(radius*2 + stroke*2 + 7, 2*radius+ 4, stepText).attr({
            fill: current == step ? "#FFF" : "#A6A6A6", 
            fontFamily: 'Montserrat',
            fontWeight: 'Light',
            fontSize: "13px",
        });
        return s.group(c2,c3, checkmark, text);
    }

    self.initProgressLine = function(paper) {
        line = paper
         .line(startingPointX+radius+stroke, startingPointY + radius + stroke, startingPointX+radius+stroke, totalSteps * ( 2*stroke+seperation))
         .attr({
            stroke: "white",
            strokeDasharray:totalSteps * seperation ,
            strokeDashoffset:(totalSteps - current) * seperation,
            strokeWidth:"3"
         });

        $.each(Object.keys(steps), function(i, step) { 
            groups[i] = self.createStep(i, step, steps[step]);
            groups[i].attr({
                transform: Snap.format("translate({x} {y})", {x:startingPointX,y:seperation*i + startingPointY })
            })
        }); 
        return groups;  
    }

    groups = self.initProgressLine(s);
};

$.fn.scrollTo = function( target, options, callback ){
  if(typeof options == 'function' && arguments.length == 2){ callback = options; options = target; }
  var settings = $.extend({
    scrollTarget  : target,
    offsetTop     : 50,
    duration      : 500,
    easing        : 'swing'
  }, options);
  return this.each(function(){
    var scrollPane = $(this);
    var scrollTarget = (typeof settings.scrollTarget == "number") ? settings.scrollTarget : $(settings.scrollTarget);
    var scrollY = (typeof scrollTarget == "number") ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt(settings.offsetTop);
    scrollPane.animate({scrollTop : scrollY }, parseInt(settings.duration), settings.easing, function(){
      if (typeof callback == 'function') { callback.call(this); }
    });
  });
}