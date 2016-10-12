var CommentForm = React.createClass({
  getInitialState: function(){
    return { author: '', text: '' };
  },
  handleAuthorChange: function(e){
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    // prevent typical action of refreshing
    e.preventDefault();
    // Set the var author and text to the state of the form as well trim the fat (whitespace)
    var author = this.state.author.trim();
    // Questionable: should we trim whitespace if its from the text input
    var text = this.state.text.trim();

    // if either dont exist, return with an alert msg
    if(!text || !author) {
      // Note! dont mess with the form state if error
      alert("Missing either author or text input");
      return;
    }

    // Set the form state to empty. very important
    this.props.onCommentSubmit({author: author, text: text});
    this.setState({author: '', text: ''})
  },
  render: function(){
    return (
      <form className="commentForm form-inline" onSubmit={this.handleSubmit} >
        <div className="form-group">
          <input 
            className="form-control" 
            type="text" 
            placeholder="Your name" 
            value={this.state.author} 
            onChange={this.handleAuthorChange} 
            ref="nameInput"
          />
        </div>
        <div className="form-group">
          <input 
            className="form-control"  
            type="text" 
            placeholder="Say something.." 
            value={this.state.text} 
            onChange={this.handleTextChange} 
          />
        </div>
        <input className="btn btn-default" type="submit" value="POST" />
      </form>
    )
  }
});

var Comment = React.createClass({
  rawMarkup: function(){
    var md = new Remarkable();
    var rawMarkup = md.render(this.props.children.toString());
    return { __html: rawMarkup };
  },

  render: function(){
    var md = new Remarkable();
    
    return (
      <div className="comment well">
        <h4 className="commentAuthor">
          {this.props.author}:
          <hr/>
        </h4>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    )
  }
});

var CommentList = React.createClass({
  render: function(){
    // Iterate through the data while mapping the results into commentNodes
    var commentNodes = this.props.data.map(function(comment){
      // For each node, return the structure below.
      return (
        <Comment author={comment.author} key={comment.id}>
          {comment.text}
        </Comment>
      )  
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    )
  }
});

var CommentBox = React.createClass({
  loadCommentsFromServer: function(){
    $.ajax ({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data){
        this.setState({data: data})
      }.bind(this),
      error: function(xhr, status, err){
        console.log(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function(){
    return {data: []};
  },
  componentDidMount: function(){
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  handleCommentSubmit: function(comment){
    var comments = this.state.data;
    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({data: newComments})

    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data){
        this.setState({data: data});
        $('html,body').animate({scrollTop: document.body.scrollHeight},"fast");
      }.bind(this),
      error: (function(xhr, status, err){
        this.setState({data: comments});  
        console.log(xhr, status, err.toString());
      }).bind(this)
    })
  },
  render: function(){
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    )
  }
});

ReactDOM.render(
  <CommentBox url="/api/comments" poll={2000} />,
  document.getElementById('content')
)