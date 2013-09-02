var  querystring  =  require ( 'querystring' );
var  https  =  require ( 'https' );
var path=require("path");
var fs = require('fs');
var  WeiboApi  =  exports . WeiboApi  =  function ( options )  {
    this . _init ( options );
}

WeiboApi . prototype  =  {
    API_BASE_URL  :  'https://api.weibo.com/2' ,
    API_HOST  :  'api.weibo.com' ,
    API_URI_PREFIX  :  '/2' ,

    _init  :  function ( options )  {
        this . options  =  this . _defaults_options (
            options ,  {
                app_key       :  null ,
                app_secret    :  null ,
                access_token  :  null ,
                user_id       :  0 ,
                refresh_token :  null 
            }
            );
        this . meId  =  this . options . user_id ;

        this . statuses     =  this . _statuses ();
        this . comments     =  this . _comments ();
        this . users        =  this . _users ();
        this . friendships  =  this . _friendships ();
        this . account      =  this . _account ();
        this . favorites    =  this . _favorites ();
        this . trends       =  this . _trends ();
        this . tags         =  this . _tags ();
        this . search       =  this . _search ();
        this . suggestions  =  this . _suggestions ();
    },


    /**
     * 必选 类型及范围 说明
     * client_id true string 申请应用时分配的AppKey
     * redirect_uri true string 授权后的回调地址,站外应用需与回调地址一致,站内应用需要填写canvas page的地址
     * response_type false string 支持的值包括code 和token 默认值为code
     * state false string 用于保持请求和回调的状态。在回调时,会在Query Parameter中回传该参数
     * display false string 授权页面类型可选范围: default,mobile,popup,wap1.2,wap2.0,js,apponweibo
     */
    getAuthorizeUrl  :  function ( options )  {
        var  options  =  this . _defaults_options (
            options , 
            {
                client_id      :  this . options . app_key ,
                redirect_uri   :  null ,
                response_type  :  'code' ,
                state          :  null ,
                display        :  'default' ,
                forcelogin:"true"
            }
            );

        return  'https://'  +  this . API_HOST  +  '/oauth2/authorize?'  +  querystring . stringify ( options );
    },

    /**
     * access_token接口
     * 必选 类型及范围 说明
     * client_id true string 申请应用时分配的AppKey
     * client_secret true string 申请应用时分配的AppSecret
     * grant_type true string 请求的类型,可以为:authorization_code ,password,refresh_token
     */
    accessToken  :  function ( options ,  cb )  {
        var  options  =  this . _defaults_options (
            options , 
            {
                client_id      :  this . options . app_key ,
                client_secret  :  this . options . app_secret ,
                grant_type     :  'authorization_code' ,
                redirect_uri   :  this . options . redirect_uri
            }
            );


        var  post_body  =  querystring . stringify ( options );
        var  headers =  {};
        headers [ "Content-length" ] =  post_body  ?  post_body . length  :  0 ;
        headers [ "Content-Type" ] =  'application/x-www-form-urlencoded' ;

        var  opts  =  {
            host     :  this . API_HOST ,
            path     :  '/oauth2/access_token' ,
            method   :  'POST' ,
            headers  :  headers 
        };        
        this . _doRequest ( opts ,  post_body ,  cb );
    },


    parseSignedRequest  :  function ( signed_request )  {
        //console.log('PARSESIGNEDREQUEST THIS', this);
        var  parts  =  signed_request . split ( '.' );
        //console.log(parts);
        var  encoed_sig  =  parts [ 0 ],  payload  =  parts [ 1 ];
        var  sig  =  new  Buffer ( encoed_sig ,  'base64' ). toString ( 'ascii' );
        var  data  =  new  Buffer ( payload ,  'base64' ). toString ( 'ascii' );
        //console.log(sig);
        //console.log(data);
        data  =  JSON . parse ( data );
        //console.log(data);

        //data.algorithm == 'HMAC_SHA256'

        this . options . user_id       =  this . meId  =  data . user_id ;
        this . options . access_token  =  data . oauth_token ;
        this . options . expires       =  data . expires ;
    },

    _post  :  function ( uri ,  options ,  cb )  {
        if  ( this . options . access_token )  {
            options [ 'access_token' ]  =  this . options . access_token ;
        }
        //console.log('WEIBO_API_METHOD_POST', options);

        var  post_body  =  querystring . stringify ( options );
        post_body=post_body.replace(/__multi__/g,"")
        var  headers =  {};
        headers [ "Content-length" ] =  post_body  ?  post_body . length  :  0 ;
        headers [ "Content-Type" ] =  'application/x-www-form-urlencoded' ;

        var  opts  =  {
            host     :  this . API_HOST ,
            path     :  this . API_URI_PREFIX  +  uri  +  '.json' ,
            method   :  'POST' ,
            headers  :  headers 
        };
        
        this . _doRequest ( opts ,  post_body ,  cb );
    },

    _get  :  function ( uri ,  options ,  cb )  {
        if  ( this . options . access_token )  {
            options [ 'access_token' ]  =  this . options . access_token ;
        }

        //console.log('WEIBO_API_METHOD_GET', options);
        
        var  opts  =  {
            host  :  this . API_HOST ,
            path  :  this . API_URI_PREFIX  +  uri  +  '.json?'  +  querystring . stringify ( options ),
            method  :  'GET' 
        };
        
        this . _doRequest ( opts ,  null ,  cb );
    },

    _doRequest  :  function ( opts ,  post_body ,  cb )  {
        var  data  =  '' ;
        var  req  =  https . request ( opts , 
            function ( res )  {
                res . setEncoding ( 'utf8' );
                res . on ( 'data' ,  function ( chunk )  {
                    data  +=  chunk ;
                //console.log(data);
                //cb(JSON.parse(data));
                });
                res . on ( 'end' , 
                    function ()  {
                        var error=null;
                        var _d=JSON.parse(data)
                        if(_d.error){
                            error=_d
                        }
                        cb ( _d,error);
                    });
            });
        req . on ( 'error' ,  cb );
        if  ( post_body )  {
            req . write ( post_body );
        }
        req . end ();
    },


    _defaults_options  :  function ( options ,  defaults )  {
        for  ( var  key  in  defaults )  {
            //console.log(key, options, defaults);
            options [ key ]  =options [ key ] ||defaults [ key ];
            
        };
        return  options ;
    },

    _statuses  :  function ()  {
        
        var  self  =  this ;
        return  {
            /*
                返回最新的公共微博 

                            必选类型及范围说明
                source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
                count false int 单页返回的记录条数，默认为50。
                page false int 返回结果的页码，默认为1。
                base_app false int 是否只获取当前应用的数据。0为否（所有数据），1为是（仅当前应用），默认为0。
             */
            publicTimeline  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/public_timeline' ;
                self . _defaults_options (
                    options, 
                    {
                        count     :  50 ,
                        page      :  1 ,
                        base_app  :  0
                    }
                    );
                
                self . _get ( uri ,  options ,  cb );
            },


            /*
                获取当前登录用户及其所关注用户的最新微博 

          	                必选 类型及范围 说明
                source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
                since_id false int64 若指定此参数，则返回ID比since_id大的微博（即比since_id时间晚的微博），默认为0。
                max_id false int64 若指定此参数，则返回ID小于或等于max_id的微博，默认为0。
                count false int 单页返回的记录条数，默认为50。
                page false int 返回结果的页码，默认为1。
                base_app false int 是否只获取当前应用的数据。0为否（所有数据），1为是（仅当前应用），默认为0。
                feature false int 过滤类型ID，0：全部、1：原创、2：图片、3：视频、4：音乐，默认为0。statuses/friends_timeline
             */
            friendsTimeline  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/friends_timeline' ;
                self . _defaults_options (
                    options , 
                    {
                        since_id  :  0 ,
                        max_id    :  0 ,
                        count     :  50 ,
                        page      :  1 ,
                        base_app  :  0 ,
                        feature   :  0
                    }
                    );
                
                self . _get ( uri ,  options ,  cb );
            },


            /*
                获取当前登录用户及其所关注用户的最新微博 
    
                        必选 类型及范围 说明
                source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
                since_id false int64 若指定此参数，则返回ID比since_id大的微博（即比since_id时间晚的微博），默认为0。
                max_id false int64 若指定此参数，则返回ID小于或等于max_id的微博，默认为0。
                count false int 单页返回的记录条数，默认为50。
                page false int 返回结果的页码，默认为1。
                base_app false int 是否只获取当前应用的数据。0为否（所有数据），1为是（仅当前应用），默认为0。
                feature false int 过滤类型ID，0：全部、1：原创、2：图片、3：视频、4：音乐，默认为0。 
             */
            homeTimeline  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/home_timeline' ;
                self . _defaults_options (
                    options , 
                    {
                        since_id  :  0 ,
                        max_id    :  0 ,
                        count     :  50 ,
                        page      :  1 ,
                        base_app  :  0 ,
                        feature   :  0
                    }
                    );
                
                self . _get ( uri ,  options ,  cb );
            },
            
            /*
                获取某个用户最新发表的微博列表 

                                必选 类型及范围 说明
                source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
                uid false int64 需要查询的用户ID。
                screen_name false string 需要查询的用户昵称。
                since_id false int64 若指定此参数，则返回ID比since_id大的微博（即比since_id时间晚的微博），默认为0。
                max_id false int64 若指定此参数，则返回ID小于或等于max_id的微博，默认为0。
                count false int 单页返回的记录条数，默认为50。
                page false int 返回结果的页码，默认为1。
                base_app false int 是否只获取当前应用的数据。0为否（所有数据），1为是（仅当前应用），默认为0。
                feature false int 过滤类型ID，0：全部、1：原创、2：图片、3：视频、4：音乐，默认为0。
                trim_user false int 返回值中user信息开关，0：返回完整的user信息、1：user字段仅返回user_id，默认为0。     
             */
            userTimeline  :  function ( options ,  cb )  {
                //console.log('THIS', self);
                self . _defaults_options (
                    options , 
                    {
                        since_id  :  0 ,
                        max_id    :  0 ,
                        count     :  50 ,
                        page      :  1 ,
                        base_app  :  0 ,
                        feature   :  0 ,
                        trim_user  :  0 
                    });

                var  uri  =  '/statuses/user_timeline' ;
                self . _get ( uri ,  options ,  cb );
            },

            /*
                批量获取指定的一批用户的微博列表     

                                必选 类型及范围 说明
                source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
                uids false string 需要查询的用户ID，用半角逗号分隔，一次最多20个。
                screen_name false string 需要查询的用户昵称，用半角逗号分隔，一次最多20个。
                count false int 单页返回的记录条数，默认为20。
                page false int 返回结果的页码，默认为1。
                base_app false int 是否只获取当前应用的数据。0为否（所有数据），1为是（仅当前应用），默认为0。
                feature false int 过滤类型ID，0：全部、1：原创、2：图片、3：视频、4：音乐，默认为0。 
             */
            timelineBatch  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/timeline_batch' ;
                self . _defaults_options (
                    options , 
                    {
                        count     :  20 ,
                        page      :  1 ,
                        base_app  :  0 ,
                        feature   :  0 
                    });
                self . _get ( uri ,  options ,  cb );
            },


            /*
                获取指定微博的转发微博列表 

                                    必选 类型及范围 说明
                source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
                id true int64 需要查询的微博ID。
                since_id false int64 若指定此参数，则返回ID比since_id大的微博（即比since_id时间晚的微博），默认为0。
                max_id false int64 若指定此参数，则返回ID小于或等于max_id的微博，默认为0。
                count false int 单页返回的记录条数，默认为50。
                page false int 返回结果的页码，默认为1。
                filter_by_author false int 作者筛选类型，0：全部、1：我关注的人、2：陌生人，默认为0。 
             */

            repostTimeline  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/repost_timeline' ;
                self . _defaults_options (
                    options , 
                    {
                        since_id  :  0 ,
                        max_id    :  0 ,
                        count     :  50 ,
                        page      :  1 ,
                        filter_by_author  :  0 
                    });
                self . _get ( uri ,  options ,  cb );
            },


            /*
                获取当前用户最新转发的微博列表     

                            必选 类型及范围 说明
                source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
                since_id false int64 若指定此参数，则返回ID比since_id大的微博（即比since_id时间晚的微博），默认为0。
                max_id false int64 若指定此参数，则返回ID小于或等于max_id的微博，默认为0。
                count false int 单页返回的记录条数，默认为50。
                page false int 返回结果的页码，默认为1。 
             */
            repostByMe  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/repost_by_me' ;
                self . _defaults_options (
                    options , 
                    {
                        since_id  :  0 ,
                        max_id    :  0 ,
                        count     :  50 ,
                        page      :  1 
                    });
                self . _get ( uri ,  options ,  cb );
            },

            
            /*
                获取最新的提到登录用户的微博列表，即@我的微博 

                                    必选 类型及范围 说明
                source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
                since_id false int64 若指定此参数，则返回ID比since_id大的微博（即比since_id时间晚的微博），默认为0。
                max_id false int64 若指定此参数，则返回ID小于或等于max_id的微博，默认为0。
                count false int 单页返回的记录条数，默认为50。
                page false int 返回结果的页码，默认为1。
                filter_by_author false int 作者筛选类型，0：全部、1：我关注的人、2：陌生人，默认为0。
                filter_by_source false int 来源筛选类型，0：全部、1：来自微博、2：来自微群，默认为0。
                filter_by_type false int 原创筛选类型，0：全部微博、1：原创的微博，默认为0。 
             */
            mentions  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/mentions' ;
                self . _defaults_options (
                    options , 
                    {
                        since_id  :  0 ,
                        max_id    :  0 ,
                        count     :  50 ,
                        page      :  1 ,
                        filter_by_author  :  0 ,
                        filter_by_source  :  0 ,
                        filter_by_type    :  0 
                    });
                self . _get ( uri ,  options ,  cb );
            },

            /*
                根据微博ID获取单条微博内容     
                        必选 类型及范围 说明
                source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
                id true int64 需要获取的微博ID。 
             */
            show  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/show' ;
                self . _get ( uri ,  options ,  cb );
            },

            
            /*
            根据微博ID批量获取微博信息

                    必选 类型及范围 说明
            source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
            ids true string 需要查询的微博ID，用半角逗号分隔，最多不超过50个。
             */
            showBatch  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/show_batch' ;
                self . _get ( uri ,  options ,  cb );
            },

            
            /*
            通过微博（评论、私信）ID获取其MID

                        必选 类型及范围说明
            source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
            id true int64 需要查询的微博（评论、私信）ID，批量模式下，用半角逗号分隔，最多不超过20个。
            type true int 获取类型，1：微博、2：评论、3：私信，默认为1。
            is_batch false int 是否使用批量模式，0：否、1：是，默认为0。
             */
            querymid  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/querymid' ;
                self . _defaults_options (
                    options , 
                    {
                        type      :  1 ,
                        is_batch  :  0 
                    });
                self . _get ( uri ,  options ,  cb );
            },

            /*
             通过微博（评论、私信）MID获取其ID
                        必选 类型及范围 说明
            source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
            mid true string 需要查询的微博（评论、私信）MID，批量模式下，用半角逗号分隔，最多不超过20个。
            type true int 获取类型，1：微博、2：评论、3：私信，默认为1。
            is_batch false int 是否使用批量模式，0：否、1：是，默认为0。
            inbox false int 仅对私信有效，当MID类型为私信时用此参数，0：发件箱、1：收件箱，默认为0 。
            isBase62 false int MID是否是base62编码，0：否、1：是，默认为0。
             */
            queryid  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/queryid' ;
                self . _defaults_options (
                    options , 
                    {
                        type      :  1 ,
                        is_batch  :  0 ,
                        inbox     :  0 ,
                        isBase62  :  0 
                    });
                self . _get ( uri ,  options ,  cb );
            },


            /*
            按天返回热门微博转发榜的微博列表

                        必选 类型及范围 说明
            source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
            count false int 返回的记录条数，最大不超过50，默认为20。
            base_app false int 是否只获取当前应用的数据。0为否（所有数据），1为是（仅当前应用），默认为0。
             */
            hotRepostDaily  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/hot/repost_daily' ;
                self . _defaults_options (
                    options , 
                    {
                        count     :  20 ,
                        base_app  :  0 
                    });
                self . _get ( uri ,  options ,  cb );
            },

            /*
            按周返回热门微博转发榜的微博列表

                        必选 类型及范围 说明
            source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
            count false int 返回的记录条数，最大不超过50，默认为20。
            base_app false int 是否只获取当前应用的数据。0为否（所有数据），1为是（仅当前应用），默认为0。
             */
            hotRepostWeekly  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/hot/repost_weekly' ;
                self . _defaults_options (
                    options , 
                    {
                        count     :  20 ,
                        base_app  :  0 
                    });
                self . _get ( uri ,  options ,  cb );
            },

            /*
            按天返回热门微博评论榜的微博列表

                        必选 类型及范围 说明
            source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
            count false int 返回的记录条数，最大不超过50，默认为20。
            base_app false int 是否只获取当前应用的数据。0为否（所有数据），1为是（仅当前应用），默认为0。
             */
            hotCommentsDaily  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/hot/comments_daily' ;
                self . _defaults_options (
                    options , 
                    {
                        count     :  20 ,
                        base_app  :  0 
                    });
                self . _get ( uri ,  options ,  cb );
            },

            /*
            按周返回热门微博评论榜的微博列表

                        必选 类型及范围 说明
            source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
            count false int 返回的记录条数，最大不超过50，默认为20。
            base_app false int 是否只获取当前应用的数据。0为否（所有数据），1为是（仅当前应用），默认为0。
             */
            hotCommentsWeekly  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/hot/comments_weekly' ;
                self . _defaults_options (
                    options , 
                    {
                        count     :  20 ,
                        base_app  :  0 
                    });
                self . _get ( uri ,  options ,  cb );
            },

            /*
            转发一条微博

                        必选 类型及范围 说明
            source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
            id true int64 要转发的微博ID。
            status false string 添加的转发文本，必须做URLencode，内容不超过140个汉字，不填则默认为“转发微博”。
            is_comment false int 是否在转发的同时发表评论，0：否、1：评论给当前微博、2：评论给原微博、3：都评论，默认为0 。
             */
            repost  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/repost' ;
                self . _defaults_options (
                    options , 
                    {
                        status      :  '转发微博' ,
                        is_comment  :  0 
                    });
                self . _post ( uri ,  options ,  cb );
            },

            /*
            根据微博ID删除指定微博
                    必选 类型及范围 说明
            source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
            id true int64 需要删除的微博ID。
             */
            destroy  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/destroy' ;
                self . _post ( uri ,  options ,  cb );
            },

            /*
            发布一条新微博
                        必选 类型及范围 说明
            source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
            status true string 要发布的微博文本内容，必须做URLencode，内容不超过140个汉字。
            lat false float 纬度，有效范围：-90.0到+90.0，+表示北纬，默认为0.0。
            long false float 经度，有效范围：-180.0到+180.0，+表示东经，默认为0.0。
            annotations false string 元数据，主要是为了方便第三方应用记录一些适合于自己使用的信息，每条微博可以包含一个或者多个元数据，必须以json字串的形式提交，字串长度不超过512个字符，具体内容可以自定。
             */
            update  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/update' ;
                self . _defaults_options (
                    options , 
                    {
                        lat         :  0.0 ,
                        //long        :  0.0 ,
                        annotations :  null
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },
            shorten:function(options ,  cb){
                var  uri  =  '/short_url/shorten' ;
                self . _defaults_options (
                    options , 
                    {
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },
            upload:function ( options , pic, cb ){
                var auth_args = {
                    type: 'post', 
                    data: {}, 
                    headers: {}
                };
                var boundary = 'boundary' + new Date().getTime();
                var dashdash = '--';
                var crlf = '\r\n';

                /* Build RFC2388 string. */
                var builder = '';

                builder += dashdash;
                builder += boundary;
                builder += crlf;
                
                var key;
                for (key in options) {
                    var value = encodeURIComponent(options[key]);
                    auth_args.data[key] = value;
                }
    
                var fileinfo=function (file) {
                    var FILE_CONTENT_TYPES={
                        '.gif': 'image/gif',
                        '.jpeg': 'image/jpeg',
                        '.jpg': 'image/jpeg',
                        '.png': 'image/png'
                    }
                    var name, content_type;
                    if (typeof file === 'string') {
                        var ext = path.extname(file);
                        content_type = FILE_CONTENT_TYPES[ext];
                        name = path.basename(file);
                    } else {
                        name = file.name || file.fileName;
                        content_type = file.fileType || file.type;
                    }
                    return {
                        name: name, 
                        content_type: content_type
                    };
                }
                var fileinfo = fileinfo(pic);    
  
                //auth_args.data.format = 'json';
                //auth_args.data.Filename = this.url_encode(fileinfo.name);
                //auth_args.data.Upload = this.url_encode('Sumbit');
     
                // 设置认证头部
                //  this.apply_auth(url, auth_args, user); 
    
                for (key in auth_args.data) {
                    /* Generate headers. key */            
                    builder += 'Content-Disposition: form-data; name="' + key + '"';
                    builder += crlf;
                    builder += crlf; 
                    /* Append form data. */
                    builder += auth_args.data[key];
                    builder += crlf;
      
                    /* Write boundary. */
                    builder += dashdash;
                    builder += boundary;
                    builder += crlf;
                }
                /* Generate headers. [PIC] */            
                builder += 'Content-Disposition: form-data; name="' + "pic" + '"';
   
                builder += '; filename="' + encodeURIComponent(fileinfo.name) + '"';
                builder += crlf;

                builder += 'Content-Type: '+ fileinfo.content_type + ';'; 
                builder += crlf;
                builder += crlf;
                var read_file=function (pic, callback) {
                    if (typeof pic === 'string') {
                        fs.stat(pic, function (err, stats) {
                            fs.readFile(pic, function (err, file_buffer) {
                                if (!err) {
                                    callback(file_buffer);
                                }
                            });
                        });
                    } else {
                        callback(pic);
                    }
                }
                var that=this;
                read_file(pic, function (file_buffer) {
                    var endstr = crlf + dashdash + boundary + dashdash +  crlf;
                    var buffer = null;
                    if (typeof BlobBuilder === 'undefined') {
                        var builderLength = new Buffer(builder).length;
                        var size = builderLength + file_buffer.length + endstr.length;
                        buffer = new Buffer(size);
                        var offset = 0;
                        buffer.write(builder);
                        offset += builderLength ;
                        file_buffer.copy(buffer, offset);
                        offset += file_buffer.length;
                        buffer.write(endstr, offset);
                    } else {
                        buffer = new BlobBuilder(); //NOTE WebKitBlogBuilder
                        buffer.append(builder);
                        buffer.append(pic);
                        buffer.append(endstr);
                        buffer = buffer.getBlob();
                    }
      
                    auth_args.headers['Content-Type'] = 'multipart/form-data;boundary=' + boundary;
                    auth_args.headers [ "Content-length" ] =  buffer  ?  buffer . length  :  0 ;
                    var  opts  =  {
                        host     :  self . API_HOST ,
                        path     :  self . API_URI_PREFIX  +  "/statuses/upload"  +  '.json' ,
                        method   :  'POST' ,
                        headers  :  auth_args.headers 
                    };
        
                    self . _doRequest ( opts ,  buffer ,  cb );
                    
                });
            },
            /*
            指定一个图片URL地址抓取后上传并同时发布一条新微博
                    必选 类型及范围 说明
            source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
            status false string 要发布的微博文本内容，必须做URLencode，内容不超过140个汉字。
            url false string 图片的URL地址，必须以http开头。
             */
            uploadUrlText  :  function ( options ,  cb )  {
                var  uri  =  '/statuses/upload_url_text' ;
                self._post(uri, options, cb);
            }
        };
    },


    /*
    获取微博官方表情的详细信息    
                必选 类型及范围 说明
    source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
    type false string 表情类别，face：普通表情、ani：魔法表情、cartoon：动漫表情，默认为face。
    language false string 语言类别，cnname：简体、twname：繁体，默认为cnname。
     */
    emotions  :  function ( options ,  cb )  {
        var  uri  =  '/emotions' ;
        this . _defaults_options (
            options , 
            {
                type      :  'face' ,
                language  :  'cnname' 
            });
        this . _get ( uri ,  options ,  cb );        
    },

    _comments  :  function ()  {
        var  self  =  this ;
        return  {

            /*
            根据微博ID返回某条微博的评论列表
                                必选 类型及范围 说明
            source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
            id true int64 需要查询的微博ID。
            since_id false int64 若指定此参数，则返回ID比since_id大的评论（即比since_id时间晚的评论），默认为0。
            max_id false int64 若指定此参数，则返回ID小于或等于max_id的评论，默认为0。
            count false int 单页返回的记录条数，默认为50。
            page false int 返回结果的页码，默认为1。
            filter_by_author false int 作者筛选类型，0：全部、1：我关注的人、2：陌生人，默认为0。
             */
            show  :  function ( options ,  cb )  {
                var  uri  =  '/comments/show' ;
                self . _defaults_options (
                    options , 
                    {
                        since_id  :  0 ,
                        max_id    :  0 ,
                        count     :  50 ,
                        page      :  1 ,
                        filter_by_author  :  0 
                    });
                self . _get ( uri ,  options ,  cb );
            },

            
            /*
            获取当前登录用户所发出的评论列表
                                必选 类型及范围 说明
            source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
            id true int64 需要查询的微博ID。
            since_id false int64 若指定此参数，则返回ID比since_id大的评论（即比since_id时间晚的评论），默认为0。
            max_id false int64 若指定此参数，则返回ID小于或等于max_id的评论，默认为0。
            count false int 单页返回的记录条数，默认为50。
            page false int 返回结果的页码，默认为1。
            filter_by_source false int 来源筛选类型，0：全部、1：来自微博的评论、2：来自微群的评论，默认为0。
             */
            byMe  :  function ( options ,  cb )  {
                var  uri  =  '/comments/by_me' ;
                self . _defaults_options (
                    options , 
                    {
                        since_id  :  0 ,
                        max_id    :  0 ,
                        count     :  50 ,
                        page      :  1 ,
                        filter_by_source  :  0 
                    });
                self . _get ( uri ,  options ,  cb );
            },

            /*
            获取当前登录用户所接收到的评论列表
                                必选 类型及范围 说明
            source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
            id true int64 需要查询的微博ID。
            since_id false int64 若指定此参数，则返回ID比since_id大的评论（即比since_id时间晚的评论），默认为0。
            max_id false int64 若指定此参数，则返回ID小于或等于max_id的评论，默认为0。
            count false int 单页返回的记录条数，默认为50。
            page false int 返回结果的页码，默认为1。
            filter_by_author false int 作者筛选类型，0：全部、1：我关注的人、2：陌生人，默认为0。
            filter_by_source false int 来源筛选类型，0：全部、1：来自微博的评论、2：来自微群的评论，默认为0。
             */
            toMe  :  function ( options ,  cb )  {
                var  uri  =  '/comments/to_me' ;
                self . _defaults_options (
                    options , 
                    {
                        since_id  :  0 ,
                        max_id    :  0 ,
                        count     :  50 ,
                        page      :  1 ,
                        filter_by_author  :  0 ,
                        filter_by_source  :  0 
                    });
                self . _get ( uri ,  options ,  cb );
            },

            /*
            获取当前登录用户的最新评论包括接收到的与发出的
                                必选 类型及范围 说明
            source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
            id true int64 需要查询的微博ID。
            since_id false int64 若指定此参数，则返回ID比since_id大的评论（即比since_id时间晚的评论），默认为0。
            max_id false int64 若指定此参数，则返回ID小于或等于max_id的评论，默认为0。
            count false int 单页返回的记录条数，默认为50。
            page false int 返回结果的页码，默认为1。
             */
            timeline  :  function ( options ,  cb )  {
                var  uri  =  '/comments/timeline' ;
                self . _defaults_options (
                    options , 
                    {
                        since_id  :  0 ,
                        max_id    :  0 ,
                        count     :  50 ,
                        page      :  1 
                    });
                self . _get ( uri ,  options ,  cb );
            },



            /*
            获取最新的提到当前登录用户的评论，即@我的评论
                                必选 类型及范围 说明
            source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
            id true int64 需要查询的微博ID。
            since_id false int64 若指定此参数，则返回ID比since_id大的评论（即比since_id时间晚的评论），默认为0。
            max_id false int64 若指定此参数，则返回ID小于或等于max_id的评论，默认为0。
            count false int 单页返回的记录条数，默认为50。
            page false int 返回结果的页码，默认为1。
            filter_by_author false int 作者筛选类型，0：全部、1：我关注的人、2：陌生人，默认为0。
            filter_by_source false int 来源筛选类型，0：全部、1：来自微博的评论、2：来自微群的评论，默认为0。
             */
            
            mentions  :  function ( options ,  cb )  {
                var  uri  =  '/comments/mentions' ;
                self . _defaults_options (
                    options , 
                    {
                        since_id  :  0 ,
                        max_id    :  0 ,
                        count     :  50 ,
                        page      :  1 ,
                        filter_by_author  :  0 ,
                        filter_by_source  :  0 
                    });
                self . _get ( uri ,  options ,  cb );
            },

            /*
            根据评论ID批量返回评论信息
                    必选 类型及范围 说明
            source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
            cids true int64 需要查询的批量评论ID，用半角逗号分隔，最大50。
             */
            showBatch  :  function ( options ,  cb )  {
                var  uri  =  '/comments/show_batch' ;
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 对一条微博进行评论
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * comment true string 评论内容，必须做URLencode，内容不超过140个汉字。
             * id true int64 需要评论的微博ID。
             * comment_ori false int 当评论转发微博时，是否评论给原微博，0：否、1：是，默认为0。             
             */
            create  :  function ( options ,  cb )  {
                var  uri  =  'comments/create' ;
                self . _defaults_options (
                    options , 
                    {
                        comment_ori  :  0
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },
            
            /**
             * 删除一条评论
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * cid true int64 要删除的评论ID，只能删除登录用户自己发布的评论。
             */
            destroy  :  function ( options ,  cb )  {
                var  uri  =  '/comments/destroy' ;
                self . _post ( uri ,  options ,  cb );
            },

            /**
             * 根据评论ID批量删除评论
             * 
             */
            destroyBatch  :  function ( options ,  cb )  {
                var  uri  =  '/comments/destroy_batch' ;
                self . _post ( uri ,  options ,  cb );
            },

            /**
             * 回复一条评论
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * cid true int64 需要回复的评论ID。
             * id true int64 需要评论的微博ID。
             * comment true string 回复评论内容，必须做URLencode，内容不超过140个汉字。
             * without_mention false int 回复中是否自动加入“回复@用户名”，0：是、1：否，默认为0。
             * comment_ori false int 当评论转发微博时，是否评论给原微博，0：否、1：是，默认为0。
             */
            reply  :  function ( options ,  cb )  {
                var  uri  =  '/comments/reply' ;
                self . _defaults_options (
                    options , 
                    {
                        without_mention  :  0 ,
                        comment_ori      :  0 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            }
        };
    },

    _users  :  function ()  {
        var  self  =  this ;
        return  {
            /**
             * 根据用户ID获取用户信息
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid false int64 需要查询的用户ID。
             * screen_name false string 需要查询的用户昵称。
             */
            show  :  function ( options ,  cb )  {
                var  uri  =  '/users/show' ;
                self . _defaults_options (
                    options , 
                    {
                        uid          :  null ,
                        screen_name  :  null 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 通过个性化域名获取用户资料以及用户最新的一条微博
 	         * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * domain true string 需要查询的个性化域名。
             */
            domainShow  :  function ( options ,  cb )  {
                var  uri  =  '/users/domain_show' ;
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 批量获取用户的基本信息
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uids true string 需要查询的用户ID，用半角逗号分隔，一次最多20个。
             * screen_name false string 需要查询的用户昵称，用半角逗号分隔，一次最多20个。
             */
            showBatch  :  function ( options ,  cb )  {
                var  uri  =  '/users/show_batch' ;
                self . _defaults_options (
                    options , 
                    {
                        uids         :  null ,
                        screen_name  :  null 
                    }
                    );
                self . _get ( uri ,  options ,  cb );                
            }
        };
    },

    _friendships  :  function ()  {
        var  self  =  this ;
        
        return  {
            /**
             * 获取用户的关注列表
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid false int64 需要查询的用户UID。
             * screen_name false string 需要查询的用户昵称。
             * count false int 单页返回的记录条数，默认为50，最大不超过200。
             * cursor false int 返回结果的游标，下一页用返回值里的next_cursor，上一页用previous_cursor，默认为0。
             */
            friends  :  function ( options ,  cb )  {
                var  uri  =  '/friendships/friends' ;
                self . _defaults_options (
                    options , 
                    {
                        uid          :  null ,
                        screen_name  :  null ,
                        count        :  50 , 
                        cursor       :  0
                    }
                    );
                
                self . _get ( uri ,  options ,  cb );

            },

            /**
             * 获取两个用户之间的共同关注人列表
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid true int64 需要获取共同关注关系的用户UID。
             * suid false int64 需要获取共同关注关系的用户UID，默认为当前登录用户。
             * count false int 单页返回的记录条数，默认为50。
             * page false int 返回结果的页码，默认为1。
             */
            friendsInCommon  :  function ( options ,  cb )  {
                var  uri  =  '/friendships/friends/in_common' ;
                self . _defaults_options (
                    options , 
                    {
                        suid   :  null ,
                        count  :  50 ,
                        page   :  1
                    }
                    );
                
                self . _get ( uri ,  options ,  cb );                
            },

            /**
             * 获取用户的双向关注列表，即互粉列表
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid true int64 需要获取双向关注列表的用户UID。
             * count false int 单页返回的记录条数，默认为50。
             * page false int 返回结果的页码，默认为1。
             * sort false int 排序类型，0：按关注时间最近排序，默认为0。
             */
            friendsBilateral  :  function ( options ,  cb )  {
                var  uri  =  '/friendships/friends/bilateral' ;
                self . _defaults_options (
                    options ,
                    {
                        page   :  1 ,
                        count  :  50 ,
                        sort   :  0
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 获取用户双向关注的用户ID列表，即互粉UID列表
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid true int64 需要获取双向关注列表的用户UID。
             * count false int 单页返回的记录条数，默认为50，最大不超过2000。
             * page false int 返回结果的页码，默认为1。
             * sort false int 排序类型，0：按关注时间最近排序，默认为0。
             */
            friendsBilateralIds  :  function ( options ,  cb )  {
                var  uri  =  '/friendships/friends/bilateral/ids' ;
                self . _defaults_options (
                    options ,
                    {
                        page   :  1 ,
                        count  :  50 ,
                        sort   :  0
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 获取用户关注的用户UID列表
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid false int64 需要查询的用户UID。
             * screen_name false string 需要查询的用户昵称。
             * count false int 单页返回的记录条数，默认为500，最大不超过5000。
             * cursor false int 返回结果的游标，下一页用返回值里的next_cursor，上一页用previous_cursor，默认为0。
             */
            friendsIds  :  function ( options ,  cb )  {
                var  uri  =  '/friendships/friends/ids' ;
                self . _defaults_options (
                    options ,
                    {
                        uid          :  null ,
                        screen_name  :  null ,
                        count        :  500 ,
                        cursor       :  0
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 批量获取当前登录用户的关注人的备注信息
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uids true string 需要获取备注的用户UID，用半角逗号分隔，最多不超过50个。
             */
            friendsRemarkBatch  :  function ( options ,  cb )  {
                var  uri  =  '/friendships/friends/remark_batch' ;
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 获取用户的粉丝列表
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid false int64 需要查询的用户UID。
             * screen_name false string 需要查询的用户昵称。
             * count false int 单页返回的记录条数，默认为50，最大不超过200。
             * cursor false int 返回结果的游标，下一页用返回值里的next_cursor，上一页用previous_cursor，默认为0。
             */
            followers  :  function ( options ,  cb )  {
                var  uri  =  '/friendships/followers' ;
                self . _defaults_options (
                    options ,
                    {
                        uid          :  null ,
                        screen_name  :  null ,
                        count        :  50 ,
                        cursor       :  0
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 获取用户粉丝的用户UID列表
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid false int64 需要查询的用户UID。
             * screen_name false string 需要查询的用户昵称。
             * count false int 单页返回的记录条数，默认为500，最大不超过5000。
             * cursor false int 返回结果的游标，下一页用返回值里的next_cursor，上一页用previous_cursor，默认为0。
             */
            followersIds  :  function ( options ,  cb )  {
                var  uri  =  '/friendships/followers/ids' ;
                self . _defaults_options (
                    options ,
                    {
                        uid          :  null ,
                        screen_name  :  null ,
                        count        :  500 ,
                        cursor       :  0
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 获取用户的活跃粉丝列表
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid true int64 需要查询的用户UID。
             * count false int 返回的记录条数，默认为20，最大不超过200。
             */
            followersActive  :  function ( options ,  cb )  {
                var  uri  =  '/friendships/followers/active' ;
                self . _defaults_options (
                    options ,
                    {
                        uid    :  null ,
                        count  :  20
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 获取当前登录用户的关注人中又关注了指定用户的用户列表
 	         * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid true int64 指定的关注目标用户UID。
             * count false int 单页返回的记录条数，默认为50。
             * page false int 返回结果的页码，默认为1。
             */
            friendsChainFollowers  :  function ( options ,  cb )  {
                var  uri  =  '/friendships/friends_chain/followers' ;
                self . _defaults_options (
                    options ,
                    {
                        uid    :  null ,
                        count  :  50 ,
                        page   :  1
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 获取两个用户之间的详细关注关系情况
             *
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * source_id false int64 源用户的UID。
             * source_screen_name false string 源用户的微博昵称。
             * target_id false int64 目标用户的UID。
             * target_screen_name false string 目标用户的微博昵称。
             */
            show  :  function ( options ,  cb )  {
                var  uri  =  '/friendships/show' ;
                self . _defaults_options (
                    options ,
                    {
                        source_id           :  null ,
                        source_screen_name  :  null ,
                        target_id           :  null , 
                        target_screen_name  :  null
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 关注一个用户
             *
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid false int64 需要关注的用户ID。
             * screen_name false string 需要关注的用户昵称。
             */
            create  :  function ( options ,  cb )  {
                var  uri  =  '/friendships/create' ;
                self . _defaults_options (
                    options ,
                    {
                        uid          :  null ,
                        screen_name  :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },

            /**
             * 根据用户UID批量关注用户
             *             
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uids true string 要关注的用户UID，用半角逗号分隔，最多不超过20个。
             */
            createBatch  :  function ( options ,  cb )  {
                var  uri  =  '/friendships/create_batch' ;
                self . _defaults_options (
                    options ,
                    {
                        uids  :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },

            /**
             * 取消关注一个用户
             *
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid false int64 需要取消关注的用户ID。
             * screen_name false string 需要取消关注的用户昵称。
             */
            destroy  :  function ( options ,  cb )  {
                var  uri  =  '/friendships/destroy' ;
                self . _defaults_options (
                    options ,
                    {
                        uid          :  null ,
                        screen_name  :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },


            /**
             * 更新当前登录用户所关注的某个好友的备注信息
             *
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid true int64 需要修改备注信息的用户UID。
             * remark true string 备注信息，需要URLencode。
             */
            remarkUpdate  :  function ( options ,  cb )  {
                var  uri  =  '/friendships/remark/update' ;
                self . _defaults_options (
                    options ,
                    {
                        uid     :  null ,
                        remark  :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            }
        };
    },

    
    _account  :  function ()  {
        var  self  =  this ;
        return  {
            /**
             * 获取用户基本信息
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid false int64 需要获取基本信息的用户UID，默认为当前登录用户。
             */
            profileBasic  :  function ( options ,  cb )  {
                var  uri  =  '/account/profile/basic' ;
                self . _defaults_options (
                    options ,
                    {
                        uid     :  null 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 获取用户的教育信息
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid false int64 需要获取基本信息的用户UID，默认为当前登录用户。
             */
            profileEducation  :  function ( options ,  cb )  {
                var  uri  =  '/account/profile/education' ;
                self . _defaults_options (
                    options ,
                    {
                        uid     :  null 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },
            
            /**
             * 批量获取用户的教育信息
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uids true int64 需要获取教育信息的用户UID，用半角逗号分隔，最多不超过20。
             */
            profileEducationBatch  :  function ( options ,  cb )  {
                var  uri  =  '/account/profile/education_batch' ;
                self . _defaults_options (
                    options ,
                    {
                        uids  :  null 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },
            
            /**
             * 获取用户的职业信息
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid false int64 需要获取基本信息的用户UID，默认为当前登录用户。
             */
            profileCareer  :  function ( options ,  cb )  {
                var  uri  =  '/account/profile/career' ;
                self . _defaults_options (
                    options ,
                    {
                        uid     :  null 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 批量获取用户的职业信息
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uids true int64 需要获取教育信息的用户UID，用半角逗号分隔，最多不超过20。
             */
            profileCareerBatch  :  function ( options ,  cb )  {
                var  uri  =  '/account/profile/career_batch' ;
                self . _defaults_options (
                    options ,
                    {
                        uids  :  null 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 获取当前登录用户的隐私设置
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             */
            getPrivacy  :  function ( options ,  cb )  {
                var  uri  =  '/account/get_privacy' ;
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 获取所有的学校列表
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * province false int 省份范围，省份ID。
             * city false int 城市范围，城市ID。
             * area false int 区域范围，区ID。
             * type false int 学校类型，1：大学、2：高中、3：中专技校、4：初中、5：小学，默认为1。
             * capital false string 学校首字母，默认为A。
             * keyword false string 学校名称关键字。
             * count false int 返回的记录条数，默认为10。
             *
             * 参数keyword与capital二者必选其一，且只能选其一
             * 按首字母capital查询时，必须提供province参数
             */
            profileSchoolList  :  function ( options ,  cb )  {
                var  uri  =  '/account/profile/school_list' ;
                self . _defaults_options (
                    options ,
                    {
                        province  :  null ,
                        city: null ,
                        area :  null ,
                        type      :  1 ,
                        capital   :  'A' ,
                        keyword   :  null ,
                        count     :  10                 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 获取当前登录用户的API访问频率限制情况
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             */
            rateLimitStatus  :  function ( options ,  cb )  {
                var  uri  =  '/account/rate_limit_status' ;
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * OAuth授权之后，获取授权用户的UID
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             */
            getUid  :  function ( options ,  cb )  {
                var  uri  =  '/account/get_uid' ;
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 更新用户的基本信息
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * screen_name true string 用户昵称，不可为空。
             * real_name false string 用户真实姓名。
             * real_name_visible false int 真实姓名可见范围，0：自己可见、1：关注人可见、2：所有人可见。
             * province true int 省份代码ID，不可为空。
             * city true int 城市代码ID，不可为空。
             * birthday false date 用户生日，格式：yyyy-mm-dd。
             * birthday_visible false int 生日可见范围，0：保密、1：只显示月日、2：只显示星座、3：所有人可见。
             * qq false string 用户QQ号码。
             * qq_visible false int 用户QQ可见范围，0：自己可见、1：关注人可见、2：所有人可见。
             * msn false string 用户MSN。
             * msn_visible false int 用户MSN可见范围，0：自己可见、1：关注人可见、2：所有人可见。
             * url false string 用户博客地址。
             * url_visible false int 用户博客地址可见范围，0：自己可见、1：关注人可见、2：所有人可见。
             * gender true string 用户性别，m：男、f：女，不可为空。
             * credentials_type false int 证件类型，1：身份证、2：学生证、3：军官证、4：护照。
             * credentials_num false string 证件号码。
             * email false string 用户常用邮箱地址。
             * email_visible false int 用户常用邮箱地址可见范围，0：自己可见、1：关注人可见、2：所有人可见。
             * lang false string 语言版本，zh_cn：简体中文、zh_tw：繁体中文。
             * description false string 用户描述，最长不超过70个汉字。
             *
             * 填写birthday参数时，做如下约定：
             * 只填年份时，请提交年份数据，其余数据置空，或者采用1986-00-00格式；
             * 只填月份时，请提交月份数据，其余数据置空，或者采用0000-08-00格式；
             * 只填某日时，请提交某日数据，其余数据置空，或者采用0000-00-28格式。
             * 当用户生日信息无月日数据，但选择只显示星座时，返回系统默认星座信息
             */
            profileBasicUpdate  :  function ( options ,  cb )  {
                var  uri  =  '/account/profile/basic_update' ;
                self . _defaults_options (
                    options , 
                    {
                        screen_name  :  null ,
                        real_name    :  null ,
                        real_name_visible  :  0 ,
                        province   :  null ,
                        city     :  null ,
                        birthday     :  null ,
                        birthday_visible  :  0 ,
                        qq           :  null ,
                        qq_visible   :  0 ,
                        msn          :  null ,
                        msn_visible  :  0 ,
                        url          :  null ,
                        url_visible  :  0 ,
                        gender       :  null ,
                        credentials_type  :  1 ,
                        credentials_num   :  null ,
                        email        :  null ,
                        email_visible  :  0 ,
                        lang         :  null ,
                        description  :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },

            /**
             * 更新当前登录用户的教育信息
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * id false string 需要修改的教育信息ID，不传则为新建，传则为更新。
             * year false int 入学年份，最小为1900，最大不超过当前年份。
             * department false string 院系或者班别。
             * visible false int 开放等级，0：仅自己可见、1：关注的人可见、2：所有人可见。
             * type true int 学校类型，1：大学、2：高中、3：中专技校、4：初中、5：小学，默认为1。
             * school_id true int 学校代码。
             */
            profileEduUpdate  :  function ( options ,  cb )  {
                var  uri  =  '/account/profile/edu_update' ;
                self . _defaults_options (
                    options , 
                    {
                        id          :  null ,
                        year        :  null ,
                        department  :  null ,
                        visible     :  0 ,
                        type        :  1 ,
                        school_id   :  null                       
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },

            /**
             * 根据学校ID删除用户的教育信息
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * id true int64 教育信息里的学校ID。
             */
            profileEduDestroy  :  function ( options ,  cb )  {
                var  uri  =  '/account/profile/edu_destroy' ;
                self . _defaults_options (
                    options , 
                    {
                        id          :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },

            /**
             * 更新当前登录用户的职业信息
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * id false string 需要更新的职业信息ID。
             * start false int 进入公司年份，最小为1900，最大为当年年份。
             * end false int 离开公司年份，至今填0。
             * department false string 工作部门。
             * visible false int 可见范围，0：自己可见、1：关注人可见、2：所有人可见。
             * province false int 省份代码ID，不可为空值。
             * city false int 城市代码ID，不可为空值。
             * company false string 公司名称，不可为空值。
             *
             * 参数province与city二者必选其一
             * 参数id为空，则为新建职业信息，参数company变为必填项，参数id非空，则为更新，参数company可选
             */
            profileCarUpdate  :  function ( options ,  cb )  {
                var  uri  =  '/account/profile/car_update' ;
                self . _defaults_options (
                    options , 
                    {
                        id         :  null ,
                        start      :  null ,
                        end        :  null ,
                        department  :  null ,
                        visible    :  0 ,
                        province   :  null ,
                        city     :  null ,
                        company    :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },

            /**
             * 根据公司ID删除用户的职业信息
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * id true int64 职业信息里的公司ID。
             */
            profileCarDestroy  :  function ( options ,  cb )  {
                var  uri  =  '/account/profile/car_destroy' ;
                self . _defaults_options (
                    options , 
                    {
                        id          :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },

            /**
             * 更新当前登录用户的头像
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * image true binary 头像图片，仅支持JPEG、GIF、PNG格式，图片大小小于5M。
             */
            avatarUpload  :  function ( options ,  cb )  {
                var  uri  =  '/account/avatar/upload' ;
                self . _defaults_options (
                    options , 
                    {
                        id          :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },

            /**
             * 更新当前登录用户的隐私设置
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * comment false int 是否可以评论我的微博，0：所有人、1：关注的人，默认为0。
             * geo false int 是否开启地理信息，0：不开启、1：开启，默认为1。
             * message false int 是否可以给我发私信，0：所有人、1：关注的人，默认为0。
             * realname false int 是否可以通过真名搜索到我，0：不可以、1：可以，默认为0。
             * badge false int 勋章是否可见，0：不可见、1：可见，默认为1。
             * mobile false int 是否可以通过手机号码搜索到我，0：不可以、1：可以，默认为0。
             */
            updatePrivacy  :  function ( options ,  cb )  {
                var  uri  =  '/account/update_privacy' ;
                self . _defaults_options (
                    options , 
                    {
                        comment    :  0 ,
                        geo        :  1 ,
                        message    :  0 ,
                        realname   :  0 ,
                        badge      :  1 ,
                        mobile     :  0 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            }
        };
    },

    _favorites  :  function ()  {
        var  self  =  this ;
        return  {
            /**
             * 获取当前登录用户的收藏列表
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * count false int 单页返回的记录条数，默认为50。
             * page false int 返回结果的页码，默认为1。
             */
            list  :  function ( options ,  cb )  {
                var  uri  =  '/favorites' ;
                self . _defaults_options (
                    options , 
                    {
                        count  :  50 ,
                        page   :  1 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 根据收藏ID获取指定的收藏信息
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * id true int64 需要查询的收藏ID。
             */
            show  :  function ( options ,  cb )  {
                var  uri  =  '/favorites/show' ;
                self . _defaults_options (
                    options , 
                    {
                        id  :  null 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 根据标签获取当前登录用户该标签下的收藏列表
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * tid true int64 需要查询的标签ID。
             * count false int 单页返回的记录条数，默认为50。
             * page false int 返回结果的页码，默认为1。
             */
            byTags  :  function ( options ,  cb )  {
                var  uri  =  '/favorites/by_tags' ;
                self . _defaults_options (
                    options , 
                    {
                        tid    :  null ,
                        count  :  50 ,
                        page   :  1
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },
            
            /**
             * 获取当前登录用户的收藏标签列表
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * count false int 单页返回的记录条数，默认为10。
             * page false int 返回结果的页码，默认为1。
             */
            tags  :  function ( options ,  cb )  {
                var  uri  =  '/favorites/tags' ;
                self . _defaults_options (
                    options , 
                    {
                        count  :  10 ,
                        page   :  1
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 添加一条微博到收藏里
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * id true int64 要收藏的微博ID。
             */
            create  :  function ( options ,  cb )  {
                var  uri  =  '/favorites/create' ;
                self . _defaults_options (
                    options , 
                    {
                        id  :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },

            /**
             * 取消收藏一条微博
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * id true int64 要收藏的微博ID。
             */
            destroy  :  function ( options ,  cb )  {
                var  uri  =  '/favorites/destroy' ;
                self . _defaults_options (
                    options , 
                    {
                        id  :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },

            /**
             * 根据收藏ID批量取消收藏
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * ids true string 要取消收藏的收藏ID，用半角逗号分隔，最多不超过10个。
             */
            destroyBatch  :  function ( options ,  cb )  {
                var  uri  =  '/favorites/destroy_batch' ;
                self . _defaults_options (
                    options , 
                    {
                        ids  :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },

            /**
             * 更新一条收藏的收藏标签
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * id true int64 需要更新的收藏ID。
             * tags false string 需要更新的标签内容，必须做URLencode，用半角逗号分隔，最多不超过2条。
             * 
             * 参数tags为空即为删除标签
             */
            tagsUpdate  :  function ( options ,  cb )  {
                var  uri  =  '/favorites/tags/update' ;
                self . _defaults_options (
                    options , 
                    {
                        id    :  null ,
                        tags  :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },

            /**
             * 更新当前登录用户所有收藏下的指定标签
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * tid true int64 需要更新的标签ID。
             * tag true string 需要更新的标签内容，必须做URLencode。
             */
            tagsUpdateBatch  :  function ( options ,  cb )  {
                var  uri  =  '/favorites/tags/update_batch' ;
                self . _defaults_options (
                    options , 
                    {
                        tid  :  null ,
                        tag  :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },

            /**
             * 删除当前登录用户所有收藏下的指定标签
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * tid true int64 需要删除的标签ID。
             * 
             * 删除标签后，该用户所有收藏中，添加了该标签的收藏均解除与该标签的关联关系
             */
            tagsDestroyBatch  :  function ( options ,  cb )  {
                var  uri  =  '/favorites/tags/destroy_batch' ;
                self . _defaults_options (
                    options , 
                    {
                        tid  :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );  
            }
        };
    },

    _trends  :  function ()  {
        var  self  =  this ;
        return  {
            /**
             * 获取某人的话题列表
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid true int64 需要获取话题的用户的UID。
             * count false int 单页返回的记录条数，默认为10。
             * page false int 返回结果的页码，默认为1。
             */
            list  :  function ( options ,  cb )  {
                var  uri  =  '/trends' ;
                self . _defaults_options (
                    options , 
                    {
                        uid    :  null ,
                        count  :  10 ,
                        page   :  1 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 判断当前用户是否关注某话题
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * trend_name true string 话题关键字，必须做URLencode。
             */
            isFollow  :  function ( options ,  cb )  {
                var  uri  =  '/trends/is_follow' ;
                self . _defaults_options (
                    options , 
                    {
                        trend_name  :  null 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 返回最近一小时内的热门话题
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * base_app false int 是否只获取当前应用的数据。0为否（所有数据），1为是（仅当前应用），默认为0。
             */
            hourly  :  function ( options ,  cb )  {
                var  uri  =  '/trends/hourly' ;
                self . _defaults_options (
                    options , 
                    {
                        base_app  :  0 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 返回最近一天内的热门话题
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * base_app false int 是否只获取当前应用的数据。0为否（所有数据），1为是（仅当前应用），默认为0。
             */
            daily  :  function ( options ,  cb )  {
                var  uri  =  '/trends/daily' ;
                self . _defaults_options (
                    options , 
                    {
                        base_app  :  0 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 返回最近一周内的热门话题
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * base_app false int 是否只获取当前应用的数据。0为否（所有数据），1为是（仅当前应用），默认为0。
             */
            weekly  :  function ( options ,  cb )  {
                var  uri  =  '/trends/weekly' ;
                self . _defaults_options (
                    options , 
                    {
                        base_app  :  0 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 关注某话题
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * trend_name true string 要关注的话题关键词。
             */
            follow  :  function ( options ,  cb )  {
                var  uri  =  '/trends/follow' ;
                self . _defaults_options (
                    options , 
                    {
                        trend_name  :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },

            /**
             * 取消对某话题的关注
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * trend_id true int64 要取消关注的话题ID。
             */
            destroy  :  function ( options ,  cb )  {
                var  uri  =  '/trends/destroy' ;
                self . _defaults_options (
                    options , 
                    {
                        trend_id  :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            }            
        };
    },

    _tags  :  function ()  {
        var  self  =  this ;
        return  {
            /**
             * 返回指定用户的标签列表
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid true int64 要获取的标签列表所属的用户ID。
             * count false int 单页返回的记录条数，默认为20。
             * page false int 返回结果的页码，默认为1。
             */
            list  :  function ( options ,  cb )  {
                var  uri  =  '/tags' ;
                self . _defaults_options (
                    options , 
                    {
                        uid    :  null ,
                        count  :  20 ,
                        page   :  1
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 批量获取用户的标签列表
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uids true string 要获取标签的用户ID。最大20，逗号分隔。
             */
            tagsBatch  :  function ( options ,  cb )  {
                var  uri  =  '/tags/tags_batch' ;
                self . _defaults_options (
                    options , 
                    {
                        uids    :  null 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 获取系统推荐的标签列表
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * count false int 返回记录数，默认10，最大10。
             */
            suggestions  :  function ( options ,  cb )  {
                var  uri  =  '/tags/suggestions' ;
                self . _defaults_options (
                    options , 
                    {
                        count  :  10 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 为当前登录用户添加新的用户标签
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * tags true string 要创建的一组标签，用半角逗号隔开，每个标签的长度不可超过7个汉字，14个半角字符。
             *
             * 无论调用该接口次数多少，每个用户最多可以创建10个标签
             */
            create  :  function ( options ,  cb )  {
                var  uri  =  '/tags/create' ;
                self . _defaults_options (
                    options , 
                    {
                        tags  :  10 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },

            /**
             * 删除一个用户标签
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * tag_id true int64 要删除的标签ID。
             */
            destroy  :  function ( options ,  cb )  {
                var  uri  =  '/tags/destroy' ;
                self . _defaults_options (
                    options , 
                    {
                        tag_id  :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            },

            /**
             * 批量删除一组标签
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * ids true string 要删除的一组标签ID，以半角逗号隔开，一次最多提交10个ID。
             *
             * 只能删除当前登录用户自己的标签
             */
            destroyBatch  :  function ( options ,  cb )  {
                var  uri  =  '/tags/destroy_batch' ;
                self . _defaults_options (
                    options , 
                    {
                        ids  :  null 
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            }
        };
    },

    _search  :  function ()  {
        var  self  =  this ;
        return  {

            /**
             * 搜索用户时的联想搜索建议
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * q true string 搜索的关键字，必须做URLencoding。
             * count false int 返回的记录条数，默认为10。
             */
            suggestionsUsers  :  function ( options ,  cb )  {
                var  uri  =  '/search/suggestions/users' ;
                self . _defaults_options (
                    options , 
                    {
                        q      :  null ,
                        count  :  10
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },


            /**
             * 搜索微博时的联想搜索建议
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * q true string 搜索的关键字，必须做URLencoding。
             * count false int 返回的记录条数，默认为10。
             */
            suggestionsStatuses  :  function ( options ,  cb )  {
                var  uri  =  '/search/suggestions/statuses' ;
                self . _defaults_options (
                    options , 
                    {
                        q      :  null ,
                        count  :  10 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 搜索学校时的联想搜索建议
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * q true string 搜索的关键字，必须做URLencoding。
             * count false int 返回的记录条数，默认为10。
             * type false int 学校类型，0：全部、1：大学、2：高中、3：中专技校、4：初中、5：小学，默认为0。
             */
            suggestionsSchools  :  function ( options ,  cb )  {
                var  uri  =  '/search/suggestions/schools' ;
                self . _defaults_options (
                    options , 
                    {
                        q      :  null ,
                        count  :  10 ,
                        type   :  0 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },
            
            /**
             * 搜索公司时的联想搜索建议
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * q true string 搜索的关键字，必须做URLencoding。
             * count false int 返回的记录条数，默认为10。
             */
            suggestionsCompanies  :  function ( options ,  cb )  {
                var  uri  =  '/search/suggestions/companies' ;
                self . _defaults_options (
                    options , 
                    {
                        q      :  null ,
                        count  :  10 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 搜索应用时的联想搜索建议
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * q true string 搜索的关键字，必须做URLencoding。
             * count false int 返回的记录条数，默认为10。
             */
            suggestionsApps  :  function ( options ,  cb )  {
                var  uri  =  '/search/suggestions/apps' ;
                self . _defaults_options (
                    options , 
                    {
                        q      :  null ,
                        count  :  10 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * @用户时的联想建议
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * q true string 搜索的关键字，必须做URLencoding。
             * count false int 返回的记录条数，默认为10，粉丝最多1000，关注最多2000。
             * type true int 联想类型，0：关注、1：粉丝。
             * range false int 联想范围，0：只联想关注人、1：只联想关注人的备注、2：全部，默认为2。
             */
            suggestionsAtUsers  :  function ( options ,  cb )  {
                var  uri  =  '/search/suggestions/at_users' ;
                self . _defaults_options (
                    options , 
                    {
                        q      :  null ,
                        count  :  10 ,
                        type   :  null ,
                        range  :  2 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 综合联想，包含用户、微群、应用等的联想建议
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * query true string 搜索的关键字，必须进行URLencode。
             * nsort_user false int 用户排序，0：按专注人最多，默认为0。
             * sort_app false int 应用排序，0：按用户数最多，默认为0。
             * sort_grp false int 微群排序，0：按成员数最多，默认为0。
             * user_count false int 返回的用户记录条数，默认为4。
             * app_count false int 返回的应用记录条数，默认为1。
             * grp_count false int 返回的微群记录条数，默认为1。
             */
            suggestionsIntegrate  :  function ( options ,  cb )  {
                var  uri  =  '/search/suggestions/integrate' ;
                self . _defaults_options (
                    options , 
                    {
                        query       :  null ,
                        nsort_user  :  0 ,
                        sort_app    :  0 ,
                        sort_grp    :  0 ,
                        user_count  :  4 ,
                        app_count   :  1 ,
                        grp_count   :  1 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 搜索与指定的一个或多个条件相匹配的微博
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * q false string 搜索的关键字，必须进行URLencode。
             * filter_ori false int 过滤器，是否为原创，0：全部、1：原创、2：转发，默认为0。
             * filter_pic false int 过滤器。是否包含图片，0：全部、1：包含、2：不包含，默认为0。
             * fuid false int64 搜索的微博作者的用户UID。
             * province false int 搜索的省份范围，省份ID。
             * city false int 搜索的城市范围，城市ID。
             * starttime false int64 开始时间，Unix时间戳。
             * endtime false int64 结束时间，Unix时间戳。
             * count false int 单页返回的记录条数，默认为10。
             * page false int 返回结果的页码，默认为1。
             * needcount false boolean 返回结果中是否包含返回记录数，true：返回、false：不返回，默认为false。
             * base_app false int 是否只获取当前应用的数据。0为否（所有数据），1为是（仅当前应用），默认为0。
             * 
             * needcount参数不同，会导致相应的返回值结构不同
             */
            statuses  :  function ( options ,  cb )  {
                var  uri  =  '/search/statuses' ;
                self . _defaults_options (
                    options , 
                    {
                        q           :  null ,
                        filter_ori  :  0 ,
                        filter_pic  :  0 ,
                        fuid        :  null ,
                        province    :  null ,
                        city     :  null ,
                        starttime   :  null ,
                        endtime     :  null ,
                        count       :  10 ,
                        page        :  1 ,
                        needcount   :  false ,
                        base_app    :  0 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 获取指定地点周边的微博列表。
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * longitude true float 经度。有效范围：-180.0到+180.0，+表示东经。
             * latitude true float 纬度。有效范围：-90.0到+90.0，+表示北纬。
             * range false int 搜索范围，单位米，默认500米，最大11132米。
             * time false int 返回结果所在的时间段，单位为分钟，指从现在开始之前的时间段。
             * sort_type false int 排序方式。默认为0，按时间排序；为1时按与中心点距离进行排序。
             * page false int 返回结果页码。默认为1。
             * count false int 每页结果数。默认10，最大50。
             * base_app false int 是否根据当前应用返回数据。默认0：全部应用；1：仅限当前应用。
             */
            geoStatuses  :  function ( options ,  cb )  {
                var  uri  =  '/search/geo/statuses' ;
                self . _defaults_options (
                    options , 
                    {
                        longitude  :  null ,
                        latitude   :  null ,
                        range      :  null ,
                        time       :  null ,
                        sort_type  :  0 ,
                        page       :  1 ,
                        count      :  10 ,
                        base_app   :  0  
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },
            
            /**
             * 通过关键词搜索用户
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * q false string 搜索的关键字，必须进行URLencode。
             * snick false int 搜索范围是否包含昵称，0：不包含、1：包含。
             * sdomain false int 搜索范围是否包含个性域名，0：不包含、1：包含。
             * sintro false int 搜索范围是否包含简介，0：不包含、1：包含。
             * stag false int 搜索范围是否包含标签，0：不包含、1：包含。
             * province false int 搜索的省份范围，省份ID。
             * city false int 搜索的城市范围，城市ID。
             * gender false string 搜索的性别范围，m：男、f：女。
             * comorsch false string 搜索的公司学校名称。
             * sort false int 排序方式，1：按更新时间、2：按粉丝数，默认为1。
             * count false int 单页返回的记录条数，默认为10。
             * page false int 返回结果的页码，默认为1。
             * base_app false int 是否只获取当前应用的数据。0为否（所有数据），1为是（仅当前应用），默认为0。
             */
            users  :  function ( options ,  cb )  {
                var  uri  =  '/search/users' ;
                self . _defaults_options (
                    options , 
                    {
                        q          :  null ,
                        snick      :  null ,
                        sdomain    :  null ,
                        sintro     :  null ,
                        stag       :  null ,
                        province   :  null ,
                        city    :  null ,
                        gender     :  null ,
                        comorsch   :  null ,
                        sort       :  1 ,
                        count      :  10 ,
                        page       :  1 ,
                        base_app   :  0 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            }
        };
    },

    _suggestions  :  function ()  {
        var  self  =  this ;
        return  {
            
            /**
             * 返回系统推荐的热门用户列表
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * category false string 推荐分类，返回某一类别的推荐用户，默认为default；如果不在以下分类中，返回空列表。default：人气关注、ent：影视名星、music：音乐、fashion：时尚、literature：文学、business：商界、sports：体育、health：健康、auto：汽车、house：房产、trip：旅行、stock：炒股、 food：美食、fate：命理、art：艺术、tech：科技、cartoon：动漫、games：游戏。
             */
            usersHot  :  function ( options ,  cb )  {
                var  uri  =  '/suggestions/users/hot' ;
                self . _defaults_options (
                    options , 
                    {
                        category  :  null 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 获取用户可能感兴趣的人
 	         * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * count false int 单页返回的记录条数，默认为10。
             * page false int 返回结果的页码，默认为1。
             */
            usersMayInterested  :  function ( options ,  cb )  {
                var  uri  =  '/suggestions/users/may_interested' ;
                self . _defaults_options (
                    options , 
                    {
                        count  :  10 ,
                        page   :  1 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 根据一段微博正文推荐相关微博用户
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * content true string 微博正文内容，必须做URLEncode，UTF-8编码。
             * num false int 返回结果数目，默认为10。
             */
            usersByStatus  :  function ( options ,  cb )  {
                var  uri  =  '/suggestions/users/by_status' ;
                self . _defaults_options (
                    options , 
                    {
                        content  :  null ,
                        num      :  10 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 返回系统推荐的热门收藏
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * count false int 每页返回结果数，默认20。
             * page false int 返回页码，默认1。
             */
            favoritesHot  :  function ( options ,  cb )  {
                var  uri  =  '/suggestions/favorites/hot' ;
                self . _defaults_options (
                    options , 
                    {
                        count  :  20 ,
                        page   :  1 
                    }
                    );
                self . _get ( uri ,  options ,  cb );
            },

            /**
             * 把某人标识为不感兴趣的人
             * 必选 类型及范围 说明
             * source true string 申请应用时分配的AppKey，调用接口时候代表应用的唯一身份。（采用OAuth授权方式不需要此参数）
             * uid true int64 不感兴趣的用户的UID。
             */
            usersNotInterested  :  function ( options ,  cb )  {
                var  uri  =  '/suggestions/users/not_interested' ;
                self . _defaults_options (
                    options , 
                    {
                        uid  :  null
                    }
                    );
                self . _post ( uri ,  options ,  cb );
            }

        };
    }
    
}