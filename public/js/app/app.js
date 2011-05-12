// subtitler
// (c) 2011 Enginimation Studio (http://enginimation.com).
// subtitler may be freely distributed under the MIT license.
"use strict";
var AppController=
{
	init:function()
	{
		this.uploadView=new ui.UploadFilesView;
		this.toolbar=new ui.ToolbarView;
		this.output = new ui.OutPutView;
	}
};
function fixSubtitles(source,delta)
{
    var subs_array=source.trim().split("\r\n\r\n"); //separating subtitles from each other
    var result='';
    for(var i=0;i<subs_array.length;i++)
    {
        var subs_array_parts=subs_array[i].split("\n");//separating elements in subtitle
        var timeLine=subs_array_parts[1];
        if(timeLine.indexOf('-->')==-1)
        {
            timeLine=subs_array_parts[2];
        }
        var time=timeLine.split("-->");//separating "start" time and "finish" time
        var new_time=[];
        for(var j=0;j<time.length;j++)
        {
            var time_array_parts=time[j].split(":");//separating on hours,minutes and seconds
            var seconds_with_millis=time_array_parts[2].split(",");//separating on seconds and milliseconds

            seconds_with_millis[0]=parseInt(seconds_with_millis[0])+delta;//changing seconds on "delta"
            var seconds=time_array_parts[2];
            seconds=seconds_with_millis[0];
            var minutes=time_array_parts[1];
            var hours=time_array_parts[0];
            while(parseInt(seconds)>60)
            {
                minutes=parseInt(minutes)+1;
                seconds=seconds-60;
            }
            while(parseInt(minutes)>60)
            {
                hours=parseInt(hours)+1;
                minutes=minutes-60;
            }
            while(parseInt(seconds)<0)
            {
                minutes=parseInt(minutes)-1;
                seconds=seconds+60;
            }
            while(parseInt(minutes)<0)
            {
                hours=parseInt(hours)-1;
                minutes=minutes+60;
            }
            new_time.push(hours+":"+minutes+":"+seconds+","+seconds_with_millis[1]);
        }

        var new_time_array_parts=new_time[0]+"-->"+new_time[1];
        subs_array_parts[1]=new_time_array_parts;
        var new_subs_string='';
        for(var k=0;k<subs_array_parts.length;k++)
        {
            new_subs_string += subs_array_parts[k] + "\n";
        }

        result+=new_subs_string+"\n";

    }
    return result;
}
var ui={};
var global = window;
$(function()
{
    ui.UploadFilesView = Backbone.View.extend(
    {
        el:$('#drop_zone'),
        filesArr:[],
        events:
        {
            'dragover':'dragOverFiles',
            'drop':'dropFiles'
        },
        render: function()
        {
           return this;
        },
        dragOverFiles: function(e)
        {
            e.stopPropagation();
            e.preventDefault();
        },
        dropFiles: function(e)
        {
            e.stopPropagation();
            e.preventDefault();
            this.handleFileSelect(e.originalEvent.dataTransfer.files); // handle FileList object.
        },
        handleFileSelect:function(files)
        {
            $(this.el).html("Uploaded files. Press 'Update subtitles'");
            var self=this;
            for (var i = 0; i<files.length; i++)
            {
                var file = files[i];
                if (!file.extension()==='srt')
                {
                    continue;
                }
                //read data
                fs.read.fileAsText(file,function(err,text)
                {
                    if(err)
                    {
                        //show some error to user
                    }
                    else
                    {
                        self.filesArr.push(text);
                    }
                });
            }
        },
        resetText:function()
        {
            $(this.el).html("Just drop subtitles file here");
        }
    });

    ui.ToolbarView = Backbone.View.extend(
    {
        el:$('#toolbar'),
        events:
        {
            'click #fix_subtitles':'fixSubtitles'
        },
        fixSubtitles:function()
        {
            var delta = parseInt(this.$('#seconds_delta').val());
            var filesArr = AppController.uploadView.filesArr;
            for(var k=0;k<filesArr.length;k++)
            {
                var originalSubtitles = filesArr[k];
                var fixedSubtitles=fixSubtitles(originalSubtitles,delta);
                AppController.output.setFixedSubtitles(fixedSubtitles);
                AppController.uploadView.resetText();
            }
        }
    });

    ui.OutPutView = Backbone.View.extend(
    {
        el:$('#fixed_subtitles'),
        setFixedSubtitles:function(fixedSubtitles)
        {
            console.log(fixedSubtitles);
            this.$(this.el).show();
            this.$(this.el).html(fixedSubtitles)
        }
    })
});