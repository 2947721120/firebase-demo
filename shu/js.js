$(window).load(function(){

  var rootRef = new Firebase("https://glowing-inferno-7011.firebaseio.com/incid/");//更换子文件夹路径


// 删除记录点击标签时，
jQuery('body').on('click', 'a', function() {
   var $rec = $(this).closest('[data-id]');
    var id = $rec.attr('data-id') || null;
    if( id ) {
       //删除任何嵌套子
       $rec.find('[data-id]').each(function() {
          rootRef.child($(this).attr('data-id')).remove(); 
       });
       
       // 删除记录
       rootRef.child(id).remove();
    }
    return false;
});

//在适当的级别添加新记录单击一个按钮时
jQuery('body').on('click', 'button', function () {
    var $input = $(this).prev('input');
    var title = $input.val();
    var parent = $input.closest('[data-id]').attr('data-id') || null;
    console.log('creating', parent, title);
    if (title) {
        rootRef.push({ 'title': title, 'parent': parent });
    }
    $input.val('');
    return false;
});

rootRef.on('child_added', function (snapshot) {
    var message = snapshot.val();
    console.log('child_added', message);
    displayTitleMessage(snapshot.name(), message.title, message.parent);
});

rootRef.on('child_removed', function(snapshot) {
    $('#records').find('[data-id="'+snapshot.name()+'"]').remove();
});

function displayTitleMessage(id, title, parentId) {
    var $parent = parentId ? findParent(parentId) : $('#records');
    var $el = makeListItem(title);
    console.log('displaying', id, parentId, $parent, title);
    // 添加一个数据parent属性，我们用它来查找父元素
    $el.appendTo($parent).attr('data-id', id);
}

function findParent(parentId) {
    return $('#records').find('[data-id="' + parentId + '"] > ul');
}

function makeListItem(title) {
    return $('#recordTemplate').clone()
    //删除ID ATTR
    .attr('id', null)
    // <span>.text（）进入<span> 标签和.text() 使用的
    .find('span').text(title)
    //导航回克隆元素并返回它
    .end();
}
});
