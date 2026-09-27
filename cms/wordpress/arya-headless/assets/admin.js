/* Media pickers: single image and sortable galleries, stored as id lists. */
(function ($) {
  function sync($box) {
    var ids = $box.find('.arya-media__list li').map(function () { return $(this).data('id'); }).get();
    $box.find('input[type=hidden]').val(ids.join(','));
  }
  $(function () {
    $('.arya-media').each(function () {
      var $box = $(this);
      var multiple = $box.data('multiple') === 1 || $box.data('multiple') === '1';
      var $list = $box.find('.arya-media__list');
      if (multiple) $list.sortable({ update: function () { sync($box); } });
      $box.on('click', '.arya-media__remove', function () { $(this).closest('li').remove(); sync($box); });
      $box.on('click', '.arya-media__add', function (e) {
        e.preventDefault();
        var frame = wp.media({ title: multiple ? 'Add photos' : 'Choose image', multiple: multiple ? 'add' : false, library: { type: 'image' } });
        frame.on('select', function () {
          if (!multiple) $list.empty();
          frame.state().get('selection').each(function (att) {
            var a = att.toJSON();
            var thumb = (a.sizes && a.sizes.thumbnail ? a.sizes.thumbnail.url : a.url);
            $list.append('<li data-id="' + a.id + '"><img src="' + thumb + '" alt=""><button type="button" class="arya-media__remove" aria-label="Remove">×</button></li>');
          });
          sync($box);
        });
        frame.open();
      });
    });
  });
})(jQuery);
