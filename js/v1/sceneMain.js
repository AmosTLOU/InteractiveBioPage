var b_Debug = false;

// var w_avatarFrame = 448;
// var h_avatarFrame = 770;
var w_avatarFrame = 501;
var h_avatarFrame = 601;

var phaserText_MousePosition;

// 1 shown in the conversation box, 3 in the related questions area
var MaxCntAnswers = 4;
var limitChInOneLine = undefined;

var Content_QuickQuestions = undefined;
var Content_AnswersToQuickQuestions = undefined;

var ListQuestions = ["My hobbies?", "Dog or Cat?", "Favorite Movie?", "Motto?"];
var ListAnswers = undefined;
var dct_synonym = { "hobby": "hobbies", "pet": "dog", "dogs": "dog", "cats": "cat", "movies": "movie", "film": "movie"}
var dct_useless = { "is": 0, "it": 0, "to": 0 , "the": 0, "a": 0, "and": 0, "me": 0, "you": 0 };



class SceneMain extends Phaser.Scene 
{
    constructor() 
    {
        super('SceneMain');
        this.quickQuestions = undefined;
        this.relatedQuestions = undefined;
        this.conManager = undefined;
        this.avatar = undefined;
        
        // 0 Bubbles of Quick Questions; 1 Conversation
        this.state = 0;  
    }

    preload() 
    {
        this.load.image('selfie', 'assets/selfie.jpg')
        this.load.image('selfieFrame', 'assets/selfieFrame.png')
        this.load.image('introBG', 'assets/introBG.png')
        this.load.image('msgBG', 'assets/Mockup/MessageBG.png');
        this.load.image('ConBoxBG', 'assets/Mockup/DialogueBox.png');        
        this.load.image('patientAvatar', 'assets/Mockup/patient_avatar.png');        
        this.load.image('doctorAvatar', 'assets/Mockup/doctor_avatar.png');        

        // this.load.image('bg', 'assets/Mockup/background_green.png');        
        this.load.image('bg', 'assets/darkBG.jpg');        
        this.load.image('InputFieldBG', 'assets/Mockup/InputFieldBG.png');        
        this.load.image('microphone', 'assets/Mockup/microphone.png');
        this.load.image('pen', 'assets/Mockup/pen.png');
        this.load.image('bubble', 'assets/Mockup/bubble.png');
        this.load.image('back', 'assets/Mockup/back.png')
        this.load.image('enter', 'assets/Mockup/enter.png')

    }

    GetQAFromJSON()
    {     
        let formatQA = 1;
        let pathJSON = undefined;

        // Get json from online resources
        // pathJSON = "https://amostlou.github.io/WebAppTest/data_V0.json";
        // Get json from files
        // pathJSON = "JSON/data_V0.json";
        pathJSON = "JSON/data_V1.json";
        
        if(formatQA == 0)
        {
            $.getJSON(pathJSON, function(json) {
                // console.log(json);
                // console.log(json.name);

                Content_QuickQuestions = json.Questions;
                ListQuestions = Content_QuickQuestions;

                Content_AnswersToQuickQuestions = json.Answers;
                ListAnswers = Content_AnswersToQuickQuestions;
            });
        }
        else if(formatQA == 1)
        {
            $.getJSON(pathJSON, function(json) {
                Content_QuickQuestions = new Array();
                Content_AnswersToQuickQuestions = new Array();
                for(let i = 0; i < json.QA.length; i++)
                {
                    Content_QuickQuestions.push(json.QA[i][0]);
                    Content_AnswersToQuickQuestions.push(json.QA[i][1]);
                }
                // ListQuestions = Content_QuickQuestions;
                ListAnswers = Content_AnswersToQuickQuestions;
            });
        }       
        
    }

    SetInputField()
    {
        let scene_self = this;
        let nameInputField = "inputField_v1";
        let el = document.getElementById(nameInputField);

        let pX_left = ww * rX_leftBnd;
        let pY_top = wh * (rY_bottomBnd + 0.03);
        let pX_width = ww * (rX_rightBnd - rX_leftBnd) - wh*0.12;
        let pY_height = wh * 0.135;
        let pX_paddingLeft = wh * 0.012;
        let pX_paddingRight = wh * 0.012;
        let pY_paddingTop = wh * 0.012;
        let pY_paddingBottom = wh * 0.012;
        let text_prompt = "What question do you have?";
        
        let img_pen = this.add.image(pX_left + wh * 0.012, pY_top + pY_paddingTop, 'pen').setDisplaySize(wh * 0.04, wh * 0.04).setOrigin(0); 
        let img_enter = this.add.image(pX_left + pX_width - wh*0.012, (pY_top + pY_top + pY_height) * 0.5, 'enter').setDisplaySize(wh * 0.055, wh * 0.07).setOrigin(1, 0.5); 
        img_enter.setInteractive();
        img_enter.on('pointerup', () => 
        {
            if(el.value == text_prompt)
            {
                alert("please input a question first!");
                return;
            }
            scene_self.RaiseQuestion(nameInputField); 
        });
        // let img_mic = this.add.image((pX_left + pX_width + ww*rX_rightBnd)*0.5, pY_top + pY_height, 'microphone').setDisplaySize(wh * 0.08, wh * 0.08).setOrigin(0.5, 1); 
        let img_InputFieldBG = this.add.image(pX_left, pY_top, 'InputFieldBG').setDisplaySize(pX_width, pY_height).setOrigin(0);
        
        el.style.top = pY_top + "px";
        el.style.left = pX_left + ww * 0.03 + "px";
        // Padding is used to create buffer area between the text and the edge.
        // But after adding padding, the actual w and h of the text area would become the sum of width and padding/height of padding,
        // So we need to substract the padding from width and height first.
        el.style.width = (pX_width - ww * 0.07 - pX_paddingLeft - pX_paddingRight) + "px";
        el.style.height = (pY_height - pY_paddingTop - pY_paddingBottom) + "px";
        el.style.paddingTop =  pY_paddingTop + "px";
        el.style.paddingBottom =  pY_paddingBottom + "px";
        el.style.paddingLeft =  pX_paddingLeft + "px";
        el.style.paddingRight =  pX_paddingRight + "px";

        el.style.borderRadius = wh * 0.015 + "px";
        el.style.fontSize = wh * 0.03 + "px";
        el.style.lineHeight = wh * 0.03 + "px";        
        el.value = text_prompt;

        // el.onchange = function(){ scene_self.RaiseQuestion(nameInputField); };
        el.onfocus = function()
        { 
            if(el.value === text_prompt)
                el.value = ""; 
        };
        // el.oninput = () => console.log(el.value);
        // el.onmouseout = () => el.blur();
        el.onkeydown = function(event)
        {             
            // console.log(event.key);
            if(event.key == "Enter")
            {                    
                event.preventDefault();
                scene_self.RaiseQuestion(nameInputField);
            }
        };

        // phaser built-in wheel is not working, have to use js built-in wheel instead
        window.onwheel = function(event){ scene_self.WheelResponse(event); };
    }

    CreateMainElements()
    {        
        this.add.image(ww * 0.5, wh * 0.5, 'bg').setDisplaySize(ww, wh);
        this.add.image(ww * 0.2, wh * 0.24, 'selfie').setDisplaySize(ww* 0.2, ww* 0.21);
        this.add.image(ww * 0.2, wh * 0.24, 'selfieFrame').setDisplaySize(ww* 0.225, ww* 0.23);
        this.add.image(ww * 0.22, wh * 0.7, 'introBG').setDisplaySize(ww* 0.42, ww* 0.28);
        let txt_canvasName = this.add.text(ww * 0.128, wh * 0.52, "Canvas Name: Amos Dong", {
            fontFamily: 'open sans',
            color: '#000000',
            fontSize: (ww * 0.011) + 'px'      
        }).setOrigin(0.5);
        let txt_preferredName = this.add.text(ww * 0.128, wh * 0.56, "Goes by: Amos(Ay-M-S)", {
            fontFamily: 'open sans',
            color: '#000000',
            fontSize: (ww * 0.011) + 'px'      
        }).setOrigin(0.5);
        let txt_expertise = this.add.text(ww * 0.28, wh * 0.52, "Expertise: C++, Python & Unity", {
            fontFamily: 'open sans',
            color: '#000000',
            fontSize: (ww * 0.011) + 'px',
            wordWrap: { width: ww * 0.3, useAdvancedWrap: true }   
        }).setOrigin(0.5);
        let txt_favGame = this.add.text(ww * 0.29, wh * 0.56, "Favorite Game: Splatoon!\nInk the ground and splat your enemy!", {
            fontFamily: 'open sans',
            color: '#000000',
            fontSize: (ww * 0.011) + 'px',
            wordWrap: { width: ww * 0.3, useAdvancedWrap: true }   
        }).setOrigin(0.5);
        let str_bio = "Hi, My name is Amos! It is so great being a game engineer. Game development is so cool! I don't really have a specific preference in terms of the post I would like to take in the future. As long as it is game-related, I will be thrilled! It is just amazing to witness something tangible come out because of my effort. Being part of the greatness gives me a great sense of achievement! I love dogs. Currently, I don't have one due to many reasons. But I believe I would have my own puppy someday in the future and treat him/her as a precious member of my family! On top of that, I like travelling, reading interesting journals, and of course, games!";
        let txt_bio = this.add.text(ww * 0.22, wh * 0.75, str_bio, {
            fontFamily: 'open sans',
            color: '#000000',
            lineSpacing: ww * 0.002,
            fontSize: (ww * 0.011) + 'px',
            wordWrap: { width: ww * 0.3, useAdvancedWrap: true }   
        }).setOrigin(0.5);

        this.SetInputField();

        let img_ConBG = this.add.image(ww * (rX_rightBnd + rX_leftBnd) * 0.5, wh * (rY_bottomBnd + rY_topBnd)* 0.5, 'ConBoxBG');
        if(b_Debug)
            img_ConBG.setDisplaySize(ww * (rX_rightBnd - rX_leftBnd), wh * (rY_bottomBnd - rY_topBnd));
        else
            img_ConBG.setDisplaySize(ww * (rX_rightBnd - rX_leftBnd), wh * (rY_bottomBnd - rY_topBnd + 2 * padding_rY));
        img_ConBG.visible = false;

        let img_backButton = this.add.image(ww * (rX_leftBnd - 0.01), wh * (rY_topBnd), 'back').setDisplaySize(wh * 0.07, wh * 0.07).setOrigin(1, 0); 
        img_backButton.setInteractive();
        img_backButton.on('pointerup', () => { this.ReturnToQuickQuestions() });
        img_backButton.visible = false;
        this.conManager = new ConManager(img_ConBG, img_backButton);
    }

    CreateQuickQuestions()
    {
        let bubbles = new Array();
        let texts = new Array();
        let coord_bubbles = [[0.47, 0.35], [0.57, 0.15], [0.70, 0.35], [0.87, 0.20]];
        let rRadius_bubbles = [0.3, 0.2, 0.37, 0.27];
        let text_bubbles = ["Hobbies", "Dog or Cat", "Favorite Movie", "Motto"];
        let r_font_text = [0.017, 0.015, 0.0187, 0.015];
        for(let i = 0; i < coord_bubbles.length; i++)
        {
            let pX = ww * coord_bubbles[i][0];
            let pY = wh * coord_bubbles[i][1];
            bubbles[i] = this.add.image(pX, pY, 'bubble').setDisplaySize(wh * rRadius_bubbles[i], wh * rRadius_bubbles[i]); 
            texts[i] = this.add.text(pX, pY, text_bubbles[i], {
                fontFamily: 'open sans',
                color: '#F8F8FF',
                fontSize: (ww * r_font_text[i]) + "px"      
            }).setOrigin(0.5);    

            bubbles[i].setInteractive();
            bubbles[i].on('pointerover', () => { texts[i].setStyle({ color: '#F00000', }); });
            bubbles[i].on('pointerout', () => { texts[i].setStyle({ color: '#F8F8FF', }); });
            bubbles[i].on('pointerup', () => { this.AnswerQuickQuestion(i) });
            // bubbles[i].on('pointerdown', () => { console.log('pointerdown'); });  
            
            let tweensScale = 0.9;
            if((i&1) == 1)
            tweensScale = 1.1;
            this.tweens.add({
                targets: bubbles[i],
                scaleX: rRadius_bubbles[i]*wh / bubbles[i].height * tweensScale,
                scaleY: rRadius_bubbles[i]*wh / bubbles[i].height * tweensScale,
                duration: 1500,
                ease: 'Sine.easeInOut',
                delay: 0,
                yoyo: true,
                repeat: -1
            });
        }

        this.quickQuestions = [bubbles, texts];    
    }

    CreateRelatedQuestions()
    {
        let rX = 0.1;
        let rY = 0.1;
        let rOffsetY = 0.05; 
        this.relatedQuestions = new Array();
        for(let i = 0; i < MaxCntAnswers-1; i++)
        {
            let txt = this.add.text(ww * rX, wh * rY, "Related Question No." + (i+1), {
                fontFamily: 'open sans',
                color: '#F8F8FF',
                fontSize: (ww * 0.013) + 'px'      
            });
            txt.setInteractive();
            txt.on('pointerover', () => { txt.setStyle({ color: '#F00000', }); });
            txt.on('pointerout', () => { txt.setStyle({ color: '#F8F8FF', }); });
            txt.visible = false;
            this.relatedQuestions.push(txt);

            rY += rOffsetY;
        }
    }

    CreateAvatar()
    {
        this.anims.create({
            key: 'idle',
            // frames: this.anims.generateFrameNumbers('avatar_idle', { start: 0, end: 284 }),
            frames: this.anims.generateFrameNumbers('avatar_idle', { start: 0, end: 184 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'speak',
            // frames: this.anims.generateFrameNumbers('avatar_speak', { start: 0, end: 280 }),
            frames: this.anims.generateFrameNumbers('avatar_speak', { start: 0, end: 168 }),
            frameRate: 24,
            repeat: 0
        });

        this.avatar = this.add.sprite(ww * 0.25 , wh * 1.02, 'avatar_idle').setScale(0.75 * wh/h_avatarFrame).setOrigin(0.5, 1);
        this.avatar.anims.play('idle', true);
        // this.avatar.setInteractive();
    }

    ExtraWork()
    {
        /* get the original size of some pictures */
        let tmpIMG = this.add.image(0, 0, "msgBG");
        // pW_OriginalMsgBg = tmpIMG.width;
        pH_OriginalMsgBg = tmpIMG.height;
        tmpIMG.visible = false;

        tmpIMG = this.add.image(0, 0, "patientAvatar");
        pH_OriginalAvatarIcon = tmpIMG.height;
        tmpIMG.visible = false;

        /* decide the limit of characters in a line */
        let txtUsedToDecideOneLineLimit = this.CreateMessageText("");
        for(let i = 0; i < 200; i++)
        {            
            // Capital W is the English letter that takes up most space width-wise
            txtUsedToDecideOneLineLimit.text += 'W';
            if( (rX_rightBnd - rX_leftBnd) < (txtUsedToDecideOneLineLimit.width / ww) )
            {
                limitChInOneLine = i;
                txtUsedToDecideOneLineLimit.visible = false;
                break;
            }
        }
        
        /* display mouse position for debugging */
        if(b_Debug)
        {
            phaserText_MousePosition = this.add.text(ww * 0.2, wh * 0.1, "0123456789\n0123456789\n0123456789\n0123456789", {
                color: '#000000',
                fontSize:  (ww * 0.0137) + 'px'      
            }).setOrigin(0.5);
        }      
    }
    

    create() 
    {        
        this.GetQAFromJSON();
        this.CreateMainElements();
        this.CreateQuickQuestions();
        this.CreateRelatedQuestions();
        // this.CreateAvatar();
        this.ExtraWork();
    } 
    
    ShowQuickQuestions(isVisible)
    {
        for (let i = 0; i < this.quickQuestions.length; i++)
        {
            for (let j = 0; j < this.quickQuestions[i].length; j++)
            {
                this.quickQuestions[i][j].visible = isVisible;
            }
        }
    }

    ShowRelatedQuestions(IndexRelatedQuestions)
    {
        let sz = Math.min(IndexRelatedQuestions.length, MaxCntAnswers-1);
        for(let i = 0; i < MaxCntAnswers-1; i++)
        {
            if(i < sz)
            {
                this.relatedQuestions[i].visible = true;
                this.relatedQuestions[i].text = ListQuestions[IndexRelatedQuestions[i]];
                this.relatedQuestions[i].on('pointerup', () => { this.AnswerQuickQuestion(IndexRelatedQuestions[i]) });
            }
            else
            {
                this.relatedQuestions[i].visible = false;
            }
        }
    }

    WheelResponse(event) 
    {
        if(this.state == 1)
        {
            let rOffset = 0.02;
            if(event.deltaY < 0)
                this.conManager.Scroll(rOffset);
            else if(0 < event.deltaY)
                this.conManager.Scroll(-rOffset);   
        }           
    }

    // to lowercase, no sign, no punctuation, to synonym, remove useless
    ConvertWordToStandardWord(word)
    {
         // Be sure the input word is all letter.
        var isAllLetter = /^[a-zA-Z]+$/.test(word);
        if(!isAllLetter)
            alert("Misusing the function ConvertWordToStandardWord!");

        // converts to lowercase at the first place
        word = word.toLowerCase();
        // exists in the dct_synonym
        if(dct_synonym[word] != undefined)
        {
            word = dct_synonym[word]
        }
        // exists in the dct_useless
        if(dct_useless[word] != undefined)
        {
            return "";
        }
        return word;
    }

    // Extract words out of sentence while removing any non-letter charcater
    // For instance, "Sta-q?!me how am I?" would become ["Sta", "q", "me", "how", "am", "I"]
    BreakSentenceIntoWords(str)
    {
        let arrayWord = str.split(' ');
        let ret = new Array();
        for(let i = 0; i < arrayWord.length; i++)
        {
            var isAllLetter = /^[a-zA-Z]+$/.test(arrayWord[i]);
            // This word only consists of letters, we can push it into ret directly.
            if(isAllLetter)
            {
                ret.push(arrayWord[i]);
                continue;
            }
            // This word contains non-letter characters, we need to extract all English words out.
            else
            {
                let w = "";
                let s = arrayWord[i];
                for(let j = 0; j < s.length; j++)
                {
                    if( ('a' <= s[j] && s[j] <='z') || ('A' <= s[j] && s[j] <='Z') )
                    {
                        w += s[j];
                        continue;
                    }
                    else
                    {
                        if(0 < w.length)
                        {
                            ret.push(w);
                            w = "";
                        }
                        continue;                            
                    }
                }
                if(0 < w.length)
                {
                    ret.push(w);
                    w = "";
                }
            }
        }
        return ret;
    }

    SelectAnswer(str_question)
    {        
        let dct = {};
        // let arrayWord = str_question.split(' ');
        let arrayWord = this.BreakSentenceIntoWords(str_question);
        for(let i = 0; i < arrayWord.length; i++)
        {                 
            let word = this.ConvertWordToStandardWord(arrayWord[i]);
            if(word.length <= 0)
                continue;
            // first appear
            if(dct[word] === undefined)
                dct[word] = 1;
            // appear again
            else
                dct[word]++;
        }
        
        let result = new Array();
        for(let k = 0; k < ListQuestions.length; k++)
        {
            let q = ListQuestions[k];
            // let arrayWord = q.split(' ');
            let arrayWord = this.BreakSentenceIntoWords(q);
            let matchScore = 0;
            for(let i = 0; i < arrayWord.length; i++)
            {
                let word = this.ConvertWordToStandardWord(arrayWord[i]);
                if(word.length <= 0)
                    continue;

                if(dct[word] === undefined)
                {
                    continue;
                }
                else
                {
                    matchScore += dct[word];
                }
            }

            if(matchScore <= 0)
                continue;
            if(result.length < MaxCntAnswers)
            {
                // k: index of the qustion, matchScore: matching score of this question
                result.push([k, matchScore]);
            }
            else if(result.length == MaxCntAnswers)
            {
                let minScore = 9999;
                let indReplaced = -1;
                for(let j = 0; j < MaxCntAnswers; j++)
                {
                    if(result[j][1] < minScore)
                    {
                        minScore = result[j][1];
                        indReplaced = j;
                    }
                }
                if(minScore < matchScore)
                {
                    result[indReplaced] = [k, matchScore];
                }
            }
            else
            {
                alert("something is wrong");
            }
        }   
        // if return value < 0, then a is in front of b. Otherwise, b is in front of a
        result.sort(function(a, b){return b[1] - a[1]});
        let ret = new Array();
        for(let i = 0; i < result.length; i++)
        {
            ret.push(result[i][0]);
            // console.log(result[i][1]);
        }
        return ret;
    }

    Create2MsgAndShow(msg_LeftSide, msg_RightSide)
    {
        msg_RightSide = this.MakeTextFit(msg_RightSide);
        if(msg_RightSide === undefined)
        {
            alert("please input a question that makes sense!");
            return;
        }  

        let playSpeakAnim = true;
        if(msg_LeftSide === undefined)
        {
            msg_LeftSide = "Sorry, we couldn't find an answer for your question."
            playSpeakAnim = false;
        }        
        msg_LeftSide = this.MakeTextFit(msg_LeftSide);
        if(msg_LeftSide === undefined)
        {
            alert("Something is wrong with our system. Sry!");
            return;
        }

        let img_PatientAvatar = this.CreateImg('patientAvatar');
        let img_bg = this.CreateImg('msgBG');
        let txt = this.CreateMessageText(msg_RightSide);
        let msg = new ConMsg(txt, img_bg, img_PatientAvatar, 1);
        this.conManager.AddMsg(msg);
        
        let img_DoctorAvatar = this.CreateImg('doctorAvatar');
        img_bg = this.CreateImg('msgBG');
        txt = this.CreateMessageText(msg_LeftSide);
        msg = new ConMsg(txt, img_bg, img_DoctorAvatar, 0);
        this.conManager.AddMsg(msg);  

        this.ShowQuickQuestions(false);
        this.conManager.ShowAllMsg(true);
        // if(playSpeakAnim)
        //     this.avatar.anims.play('speak', true);
        this.state = 1;
    }

    RaiseQuestion(i_nameInputField) 
    {
        let el = document.getElementById(i_nameInputField);
    	let text = el.value;      
        
        let IndexRelatedQuestions = new Array();
        let IndexAnswers = this.SelectAnswer(text);
        let msg_RightSide = text;
        let msg_LeftSide = undefined;
        if(0 < IndexAnswers.length)
        {
            msg_LeftSide = ListQuestions[IndexAnswers[0]] +"\n\n" + ListAnswers[IndexAnswers[0]];
            if(1 < IndexAnswers.length)
            {                
                for(let i = 1; i < IndexAnswers.length; i++)
                {
                    IndexRelatedQuestions.push(IndexAnswers[i]);
                }
            }
        }   
        // this.ShowRelatedQuestions(IndexRelatedQuestions);                 
        this.Create2MsgAndShow(msg_LeftSide, msg_RightSide);
        el.value = "";
    }
    

    AnswerQuickQuestion(indexQuestion)
    {        
        let msg_RightSide = Content_QuickQuestions[indexQuestion];
        let msg_LeftSide = Content_AnswersToQuickQuestions[indexQuestion];
        this.Create2MsgAndShow(msg_LeftSide, msg_RightSide);
    }

    ReturnToQuickQuestions()
    {
        if(this.state != 0)
        {
            this.ShowQuickQuestions(true);
            this.ShowRelatedQuestions([]);
            this.conManager.ShowAllMsg(false);
            // this.avatar.anims.play('idle', true);
            this.state = 0;
        }        
    }


    // This function is not supposed to delete any char, just adding '\n' to the necessary positions
    // Later found out, wordwrap could achieve better effect in a more efficient way
    // https://phaser.io/examples/v3/view/game-objects/text/word-wrap-by-width#
    MakeTextFit(text)
    {
        // Replace "\n" with " \n " first, so all '\n' could be extracted and stored in arrayWord after the split(' ') operation
        text = text.replace(/\n/g, " \n ");
        let arrayWord = text.split(' ');

        let lines = new Array();
        let oneLine = "";
        for(let i = 0; i < arrayWord.length; )
        {            
            if(limitChInOneLine < arrayWord[i].length)
                return undefined;
            // This situation may happen if there are multiple blank spaces between 2 words
            if(arrayWord[i].length <= 0)
            {
                i++;
                continue;
            }
            if(arrayWord[i] == '\n')
            {
                oneLine += '\n';
                lines[lines.length] = oneLine;
                oneLine = "";
                i++;
                continue;
            }

            let oneLine_prospective = oneLine;
            if(oneLine.length <= 0)
                oneLine_prospective = arrayWord[i];
            else
                oneLine_prospective = oneLine + " " + arrayWord[i];
            if(oneLine_prospective.length <= limitChInOneLine)
            {
                oneLine = oneLine_prospective;
                if(i+1 == arrayWord.length)
                {
                    lines[lines.length] = oneLine;
                    break;
                }
                i++;                
            }
            else
            {
                oneLine += '\n';
                lines[lines.length] = oneLine;
                oneLine = "";
            }
        }
        let content = "";
        for(let i = 0; i < lines.length; i++)
            content += lines[i];
        if(content.length <= 0)
            return undefined;
        else
            return content;
    }

    CreateMessageText(content, rX=0, rY=0)
    {
        let txt = this.add.text(ww * rX, wh * rY, content, {
            fontFamily: 'open sans',
            color: '#000000',
            fontSize: (ww * 0.013) + 'px'      
        });
        return txt;
    }

    CreateImg(label, rW=-1, rH=-1, rX=0, rY=0)
    {
        let img = this.add.image(ww * rX, wh * rY, label);
        if(rW != -1 && rH != -1)
            img.setDisplaySize(ww * rW, wh * rH); 
        return img;
    }

    CreateText_ByJS()
    {
        let el = document.createElement("p");
        let textNode = document.createTextNode("0123456789");
        el.appendChild(textNode);
        document.body.appendChild(el);
        el.style.position = "absolute"; 
        el.style.top = ww * 0.2 + "px";
        el.style.left = wh * 0.3 + "px";
        el.style.width = ww * 0.1 + "px";
        el.style.height = wh * 0.1 + "px";
    }

    update() 
    {
        // let cursors = this.input.keyboard.createCursorKeys();
        // let offset = 2;
        // if (cursors.up.isDown)
        // {
        //     console.log("Up");
        //     this.conManager.Scroll(-offset);
        // }
        // else if (cursors.down.isDown)
        // {
        //     console.log("Down");
        //     this.conManager.Scroll(offset);
        // }
        // console.log(this.conManager.MsgCount());

        // if(!this.avatar.anims.isPlaying)
        // {
        //     // console.log("No animation is playing right now");
        //     this.avatar.anims.play('idle', true);
        // }

        if(b_Debug)
        {
            phaserText_MousePosition.text = "pX: " + this.input.mousePointer.x + 
                                "\t\tpY: " + this.input.mousePointer.y + "\n" +
                                "rX: " + (this.input.mousePointer.x/ww).toFixed(2) + 
                                "\t\trY: " + (this.input.mousePointer.y/wh).toFixed(2);
        }      
        
        if(isMobile)
        {
            // portrait mode
            if(window.innerWidth < window.innerHeight)
            {
                // phaserText_MousePosition.text = "nonononono!!!!!";
            }
            // landscape mode
            else if(window.innerHeight < window.innerWidth)
            {
                // phaserText_MousePosition.text = "good!!!!!!";
            }
            // square?
            else
            {

            }
        }
    }
    
}



