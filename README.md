# jquery.slide
轮播插件

##使用方式
    $('.tab').slide({
      tabtag: "auto",
      conbox: $(".panes"),
      effect: "fade",
      auto: 5000,
      act: "hover",
      contag: $(".panes>div")
    });

    $(".prev").click(function () {
      $(".tab").slide("prev");
    })
    
    $(".next").click(function () {
      $(".tab").slide("next");
    })