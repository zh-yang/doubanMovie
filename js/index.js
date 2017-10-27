var Helper = {
  isToEnd: function($viewport, $content){
    return $viewport.height() + $viewport.scrollTop() +10 > $content.height()
  },

createNode: function(movie){
  var template = `<div class="item">
    <a href="#">
    <div class="cover">
    <img src="" alt="">
        </div>
    <div class="detail">
    <h2></h2>
    <div class="extra"><span class="score"></span>分 / <span class="collect"></span>收藏</div>
    <div class="extra"><span class="year"></span> / <span class="type"></span></div>
    <div class="extra">导演: <span class="director"></span></div>
    <div class="extra">主演: <span class="actor"></span></div>
    </div>
    </a>
  </div>`

  var $node = $(template)
  $node.find('a').attr('href', movie.alt)
  $node.find('.cover img')
  .attr('src', movie.images.medium )
  $node.find('.detail h2').text(movie.title)
  $node.find('.score').text(movie.rating.average )
  $node.find('.collect').text(movie.collect_count )
  $node.find('.year').text(movie.year)
  $node.find('.type').text(movie.genres.join(' / '))
  $node.find('.director').text(function(){
    var directorsArr = []
    movie.directors.forEach(function(item){
      directorsArr.push(item.name)
    })
    return directorsArr.join('、')
  })
  $node.find('.actor').text(function(){
    var actorArr = []
    movie.casts.forEach(function(item){
      actorArr.push(item.name)
    })
    return actorArr.join('、')
  })
  return $node
  }
}

var Top250Page = {

  init: function(){
    this.$container = $('#top250')
    this.$content = this.$container.find('.container')
    this.index = 0
    this.isFinish = false
    this.isLoading = false

    this.bind()
    this.start()
  },
  bind: function(){
    var _this = this
    this.$container.scroll(function(){
      if(!_this.isFinish && Helper.isToEnd(_this.$container, _this.$content)){
        _this.start()
      }
    })       
  },
  start: function(){
    var _this = this
    this.getData(function(data){
      _this.render(data)
    })
  },

  getData: function(callback){
    var _this = this
    if(_this.isLoading) return;
    _this.isLoading = true
    _this.$container.find('.loading').show()
    $.ajax({
      url: '//api.douban.com/v2/movie/top250',
      data: {
        start: _this.index||0
      },
      dataType: 'jsonp',
      success: function(ret){
        _this.index += 20
        if(_this.index >= ret.total){
          _this.isFinish = true
        }
        callback&&callback(ret)
        _this.isLoading = false
        _this.$container.find('.loading').hide()
      },
      error: function(xhr, type){
        console.log('数据异常')
        _this.isLoading = false
        _this.$container.find('.loading').hide()
      }
    })      
  },
  render: function(data){
    var _this = this
    data.subjects.forEach(function(movie){
      _this.$content.append(Helper.createNode(movie))
    })
  }
}

var UsBoxPage = {
  init: function(){
    this.$container = $('#beimei')
    this.$content = this.$container.find('.container')
    this.start()
  },

  start: function(){
    var _this = this
    this.getData(function(data){
      _this.render(data)
    })
  },

  getData: function(callback){
    var _this = this
    _this.$container.find('.loading').show()
    $.ajax({
      url: '//api.douban.com/v2/movie/us_box',
      dataType: 'jsonp',
      success: function(ret){
        callback&&callback(ret)
        _this.$container.find('.loading').hide()
      },
      error: function(){
        console.log('数据异常')
        _this.$container.find('.loading').hide()
      }
    })      
  },
  render: function(data){
    var _this = this
    data.subjects.forEach(function(item){
      _this.$content.append(Helper.createNode(item.subject))
    })
  }
}

var SearchPage = {
  init: function(){
    this.$container = $('#search')
    this.$input = this.$container.find('input')
    this.$btn = this.$container.find('.button')
    this.$content = this.$container.find('.search-result')
    this.bind()
  },
  bind: function(){
    var _this = this
    this.$btn.click(function(){
      _this.getData(_this.$input.val(), function(data){
        console.log(data)
        _this.render(data)
      })
    })
  },
  getData: function(keyword, callback){
    var _this = this
    _this.$container.find('.loading').show()
    $.ajax({
      url: '//api.douban.com/v2/movie/search',
      data: {
        q: keyword
      },
      dataType: 'jsonp',
      success: function(ret){
        callback&&callback(ret)
        _this.$container.find('.loading').hide()
      },
      error: function(){
        console.log('数据异常')
        _this.$container.find('.loading').hide()
      }
    })  
  },
  render: function(data){
    var _this = this
    data.subjects.forEach(function(item){
      _this.$content.append(Helper.createNode(item))
    })
  }
}

var App = {
  init: function(){
    this.bind()
    Top250Page.init()
    UsBoxPage.init()
    SearchPage.init()
  },
  bind: function(){
    $('footer>div').click(function(){
      $(this).addClass('active')
      .siblings()
      .removeClass('active')
      $('main>section').css('display','none')
                       .eq($(this).index())
                       .css('display','block')
    })

    $.each($('main>section'),function(index,item){
      var hammertime = new Hammer(item)
      hammertime.on('swipeleft', function () {       
        if(index === $('main>section').length-1){
          return
        }else{
          $('footer>div').eq(index).removeClass('active')
          $('footer>div').eq(index+1).addClass('active')
          $(item).css('display','none')
          $('main>section').eq(index+1).css('display','block')
        }
      })

      hammertime.on('swiperight', function () {       
        if(index === 0){
          return
        }else{
          $('footer>div').eq(index).removeClass('active')
          $('footer>div').eq(index-1).addClass('active')
          $(item).css('display','none')
          $('main>section').eq(index-1).css('display','block')
        }
      }) 
    })
    window.ontouchmove = function(e){
      e.preventDefault()
    }
    $('section').each(function(){
      this.ontouchmove = function(e){
        e.stopPropagation()
      }
    })
  }
}
App.init()