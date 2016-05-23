angular.module('meanmail').directive('mailListItem', function() {

  function mailItemController($element, $scope) {
      this.$scope = $scope;

      this.container = $element.find('.panes.wrapper')[0];
      this.direction = Hammer.DIRECTION_HORIZONTAL;

      this.panes = Array.prototype.slice.call(this.container.children, 0);
      this.containerSize = this.container.offsetWidth;

      $(window).resize(function(event) {
        this.containerSize = this.container.offsetWidth;
      });

      this.currentIndex = 1;

      this.hammer = new Hammer.Manager(this.container);
      this.hammer.add(new Hammer.Pan({ direction: this.direction, threshold: 10 }));
      this.hammer.on("panstart panmove panend pancancel", Hammer.bindFn(this.onPan, this));
      this.show(this.currentIndex);
  }


  mailItemController.prototype = {

      show: function(showIndex, percent, animate){
          showIndex = Math.max(0, Math.min(showIndex, this.panes.length - 1));
          percent = percent || 0;

          var className = this.container.className;
          if(animate) {
              if(className.indexOf('animate') === -1) {
                  this.container.className += ' animate';
              }
          } else {
              if(className.indexOf('animate') !== -1) {
                  this.container.className = className.replace('animate', '').trim();
              }
          }

          var paneIndex, pos, translate;
          for (paneIndex = 0; paneIndex < this.panes.length; paneIndex++) {
              pos = (this.containerSize / 100) * (((paneIndex - showIndex) * 100) + percent);
              if(this.direction & Hammer.DIRECTION_HORIZONTAL) {
                  translate = 'translate3d(' + pos + 'px, 0, 0)';
              } else {
                  translate = 'translate3d(0, ' + pos + 'px, 0)';
              }
               this.panes[paneIndex].style.transform = translate;
               this.panes[paneIndex].style.mozTransform = translate;
               this.panes[paneIndex].style.webkitTransform = translate;
          }

          this.currentIndex = showIndex;
      },

      onPan : function (ev) {
          var delta = ev.deltaX;
          var percent = (100 / this.containerSize) * delta;
          var animate = false;

          $(this.panes[0]).addClass('grey');
          $(this.panes[2]).addClass('grey');
          if (percent > 20) {
            $(this.panes[0]).removeClass('grey');
            $(this.panes[0]).addClass('red');
          }
          if (percent < -20) {
            $(this.panes[2]).removeClass('grey');
            $(this.panes[2]).addClass('green');
          }
          if (ev.type == 'panend' || ev.type == 'pancancel') {
              if (Math.abs(percent) > 20 && ev.type == 'panend') {
                  this.currentIndex += (percent < 0) ? 1 : -1;

                  if(percent > 0) {
                    this.$scope.$emit('mail-item-remove', this.$scope.messageId);
                  }
                  else {
                    this.$scope.$emit('mail-item-archive', this.$scope.messageId);
                  }
              }
              percent = 0;
              animate = true;
          }

          this.show(this.currentIndex, percent, animate);
      }
  };

  return {
    restrict: 'E',
    templateUrl: '/components/mail-list-item.html',
    scope: {
      messageId: '='
    },
    transclude: true,
    controller: mailItemController,
  };
});
