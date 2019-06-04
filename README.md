# wfs

`TCP文件上传服务，基于nodejs 8.1.0/typescript/socket`

# Start server
 
 1. npm i 
 2. npm start 
 3. 开发模式（日志输出）启动 npm run dev 或者 DEBUG=* node ./build/index.js

# 上传协议

客户端向服务端发送文件:

    本次传输的包总长度(0-4)
    +协议说明JSON长度(4-8)
    {
        "md5":"E96261B90BE7B1895E9193D9CB9AAC5A",
        "crc":"F9C19B6F",
        "cmd":"1",
        "fileName":"0483737.xls",
        "offset":0,
        "user":
        {
         "sender":"serverid-gyj","receiver":"serverid-joe"
        },
        "fileLength":83456,
        "client":
        {
            "name":"realicq",
            "version":"6.5"    
        },
        "complete":1
    }
    +文件流长度(4位)+文件流

协议说明：

    md5:文件唯MD5值，唯一标识，服务器将以MD5值做为文件名存储，如果MD5值存在，文件将秒传。

    crc：文件流的较验值，服务端将和客户端对比。

    cmd:    normal : 1,//    1(正常传输)
            pause : 2,//    2（暂停）
            cancel : 3//    3（取消）

    fileName: 传输的文件名。

    offset：传输的偏移量。

    user:操作人的用户信息，客户端可以自己定义。

    fileLength:文件总长度。

    client:客户端信息

    complete:1 ，0：不需要做任务事（默认），1：需要把文件信息写入队列。

服务端回复客户端：

      json长度(0-4)+{success: true, code: 状态值, message: ''ok.',accept:124545}
      success:true/false，服务端操作是否成功。
      code:状态值，详细见下面说明。
      message:文字说明。
      accept:当前已经接收的数据长度。
      
`重要：客户端上传完成，当文件比较大的时候，服务端校验MD5需要时间，此时应该等待服务端返回304后再关闭客户端连接。`

服务端发送给客户端的状态值：

        analyticalError:500, //解析包失败

        checkCRCFail:501,    //文件包校验失败

        writeFileError:502, //文件写入失败

        cancel:503, //取消传输

        pause : 504, //暂停

        maxLimitError:505,//文件超出最大限制,

        success:200,  //文件块写成功

        complete:304   //传输完成








