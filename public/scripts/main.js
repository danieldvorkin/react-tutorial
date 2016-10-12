var CommentForm = React.createClass({
  render: function(){
    return (
      <div className="commentForm">
        Hello, world! I am a CommentForm
      </div>
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
  render: function(){
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm />
      </div>
    )
  }
});

ReactDOM.render(
  <CommentBox url="/api/comments" poll={2000} />,
  document.getElementById('content')
)