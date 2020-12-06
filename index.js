$("ul").on("click","li",function(){
  $(this).toggleClass("completed");
});
$("ul").on("click","span",function(event){
  $(this).parent().fadeOut(500,function(){
    $(this).remove();
  });
  event.stopPropagation();
});
$("input").keypress(function(event){
  if(event.which===13){
    var newText = $(this).val();
    $(this).val("");
    $("ul").append("<li><span>X</span> " + newText + "</li>");
  }
});
$(".fa-plus").click(function(){
  $("input").fadeToggle();
});
