import { AgeGroup, SolutionCard, AssessmentDefinition, Language } from './types';

// Helper to get localized age groups
export const getAgeGroups = (lang: Language): AgeGroup[] => {
  if (lang === 'en') {
    return [
      { id: 'toddler', label: '1-3 Years', range: '1-3 years', description: 'Early Development & Sensory' },
      { id: 'preschool', label: '3-6 Years', range: '3-6 years', description: 'Preschool & Socializing' },
      { id: 'school', label: '6-12 Years', range: '6-12 years', description: 'Focus & Emotions' },
      { id: 'teen', label: '12-18 Years', range: '12-18 years', description: 'Puberty & Identity' },
    ];
  }
  return [
    { id: 'toddler', label: '1-3 岁', range: '1-3 years', description: '早期发展与感官统合' },
    { id: 'preschool', label: '3-6 岁', range: '3-6 years', description: '学前准备与社交萌芽' },
    { id: 'school', label: '6-12 岁', range: '6-12 years', description: '学龄期专注力与情绪' },
    { id: 'teen', label: '12-18 岁', range: '12-18 years', description: '青春期心理与人格' },
  ];
};

export const getMilestones = (lang: Language): Record<string, string> => {
  if (lang === 'en') {
    return {
      toddler: `**1-3 Years:**\nMotor: Runs steadily, jumps with two feet.\nSpeech: Uses 3-4 word sentences.\nSocial: Imitates others, parallel play.`,
      preschool: `**3-6 Years:**\nCognitive: Understands cause/effect, fantasy vs reality.\nSocial: Cooperative play, sharing.\nEmotional: Verbalizes anger or sadness.`,
      school: `**6-12 Years:**\nFocus: 20-40 min attention span.\nRules: Values fairness.\nPeers: Friends become more important than parents.`,
      teen: `**12-18 Years:**\nThinking: Abstract logic.\nIndependence: Strong desire for autonomy.\nIdentity: "Who am I?" exploration.`
    };
  }
  return {
    toddler: `**1-3岁 发展基准：**\n动作：能平稳奔跑，尝试双脚跳。\n语言：能说出3-4个字的短句。\n社交：开始模仿他人，主要进行平行游戏（各玩各的）。`,
    preschool: `**3-6岁 发展基准：**\n认知：能理解因果关系，区分幻想与现实。\n社交：开始合作游戏，懂得轮流和分享。\n情绪：尝试用语言表达生气或难过。`,
    school: `**6-12岁 发展基准：**\n专注力：能保持20-40分钟的专注（视年龄而定）。\n规则：重视公平和规则。\n同伴：朋友评价变得比父母评价更重要。`,
    teen: `**12-18岁 发展基准：**\n思维：具备抽象逻辑思维和假设性思考能力。\n独立性：强烈渴望心理独立。\n同一性：积极探索“我是谁”和未来的方向。`
  };
};

export const getAssessmentLibrary = (lang: Language): Record<string, AssessmentDefinition[]> => {
  // Common tags (id, tags) remain same, titles/questions change
  if (lang === 'en') {
    return {
      toddler: [
        {
          id: 'dev_milestone',
          title: 'ASQ-3 Development Screening (Simplified)',
          description: 'Covers communication, motor skills, and problem solving.',
          tags: ['development', 'motor', 'speech'],
          questions: [
            "Does the child imitate your movements?",
            "Can the child say at least 6 specific words?",
            "Can the child stack a tower of 3 blocks?",
            "Does the child walk steadily without falling often?",
            "Does the child smile at themselves in the mirror?"
          ]
        },
        {
          id: 'autism_mchat',
          title: 'Early Social Communication (M-CHAT Ref)',
          description: 'Screening for early signs of autism spectrum traits.',
          tags: ['autism', 'social'],
          questions: [
             "If you point at something across the room, does the child look at it?",
             "Does the child play pretend/make-believe?",
             "Is the child interested in other children?",
             "Does the child point with one finger to ask for help?",
             "Does the child respond to their name immediately?"
          ]
        },
        {
          id: 'sensory',
          title: 'Sensory Sensitivity',
          description: 'Evaluates reactions to sound, touch, and movement.',
          tags: ['sensory', 'autism_risk'],
          questions: [
             "Does the child show extreme fear of loud noises (vacuum, dryer)?",
             "Does the child refuse certain clothing textures or foods?",
             "Does the child seek excessive spinning or jumping?",
             "Does the child dislike being cuddled?",
             "Is eye contact brief or avoided?"
          ]
        }
      ],
      preschool: [
         {
          id: 'social_emotional',
          title: 'Preschool Social-Emotional',
          description: 'Evaluates empathy and peer interaction.',
          tags: ['social', 'emotional'],
          questions: [
            "Can the child identify others' emotions (happy/sad)?",
            "Does the child take turns?",
            "Does the child recover quickly after losing a game?",
            "Does the child use words instead of hitting when angry?",
            "Can the child follow simple game rules?"
          ]
        },
        {
          id: 'adhd_early',
          title: 'Early Focus & Hyperactivity',
          description: 'Distinguish active toddler behavior from potential ADHD.',
          tags: ['adhd', 'impulse'],
          questions: [
            "Does the child act as if driven by a motor?",
            "Does the child act impulsively in dangerous ways?",
            "Does the child shift from one activity to another very quickly?",
            "Does the child frequently interrupt others?",
            "Does the child have trouble sitting still for a story?"
          ]
        },
        {
          id: 'behavior_check',
          title: 'Behavioral Screening',
          description: 'Screens for aggression, withdrawal, and attention.',
          tags: ['behavior', 'attention'],
          questions: [
             "Does the child have frequent, long tantrums?",
             "Can the child sit for a 5-minute story?",
             "Does the child hit, bite, or kick others?",
             "Is the child overly clingy in new places?",
             "Is the child constantly fidgeting?"
          ]
        }
      ],
      school: [
        {
          id: 'attention_snap',
          title: 'Attention & Hyperactivity (SNAP-IV Ref)',
          description: 'Assessment for ADHD symptoms.',
          tags: ['adhd', 'focus'],
          questions: [
            "Makes careless mistakes in schoolwork?",
            "Has difficulty sustaining attention in tasks?",
            "Does not seem to listen when spoken to directly?",
            "Fails to finish schoolwork or chores?",
            "Often loses things needed for tasks?",
            "Fidgets with hands or feet?",
            "Runs about or climbs excessively?",
            "Interrupts or intrudes on others?"
          ]
        },
        {
          id: 'autism_social',
          title: 'Social Interaction (ASSQ Ref)',
          description: 'Screening for high-functioning autism traits.',
          tags: ['autism', 'social'],
          questions: [
             "Speaks like a 'little professor'?",
             "Has intense focus on specific topics (e.g., trains)?",
             "Has trouble understanding jokes or sarcasm?",
             "Insists on specific routines?",
             "Socially clumsy or awkward?"
          ]
        },
        {
          id: 'conduct_sdq',
          title: 'Strengths & Difficulties (SDQ Ref)',
          description: 'Evaluates conduct and peer relationships.',
          tags: ['conduct', 'social'],
          questions: [
             "Often has temper tantrums?",
             "Generally obedient?",
             "Often fights with other children?",
             "Often unhappy, down-hearted?",
             "Gets along better with adults than children?"
          ]
        }
      ],
      teen: [
        {
          id: 'depression_phq',
          title: 'Adolescent Mood Screening (PHQ-9 Ref)',
          description: 'Screens for low mood and interest loss.',
          tags: ['depression', 'mood'],
          questions: [
             "Little interest or pleasure in doing things?",
             "Feeling down, depressed, or hopeless?",
             "Trouble falling or staying asleep?",
             "Feeling tired or having little energy?",
             "Poor appetite or overeating?",
             "Feeling bad about yourself?"
          ]
        },
        {
          id: 'emotional_psc',
          title: 'Anxiety & Stress (GAD Ref)',
          description: 'Screens for generalized anxiety.',
          tags: ['anxiety', 'stress'],
          questions: [
             "Feeling nervous, anxious, or on edge?",
             "Not being able to stop worrying?",
             "Trouble relaxing?",
             "Becoming easily annoyed?",
             "Feeling physical pain due to stress?"
          ]
        },
        {
          id: 'autonomy',
          title: 'Independence & Conflict',
          description: 'Evaluates family boundaries and communication.',
          tags: ['family', 'conflict'],
          questions: [
             "Opposes parents just for the sake of it?",
             "Hides whereabouts or online activity?",
             "Willing to ask parents for help with big problems?",
             "Feels parents don't understand their world?",
             "Mood swings are unpredictable?"
          ]
        }
      ]
    };
  }
  
  // Default Chinese
  return {
    toddler: [
      {
        id: 'dev_milestone',
        title: 'ASQ-3 早期发育筛查 (简化版)',
        description: '涵盖沟通、粗大动作、精细动作、解决问题及个人社会性五个领域。',
        tags: ['development', 'motor', 'speech'],
        questions: [
          "孩子能模仿您的动作吗（如拍手、摸头）？",
          "孩子能说出至少6个具体的词汇吗？",
          "孩子能用积木搭高至少3层吗？",
          "孩子走路时是否平稳，很少跌倒？",
          "孩子会对镜子里的自己微笑或做动作吗？"
        ]
      },
      {
        id: 'autism_mchat',
        title: '早期社交沟通观察 (M-CHAT参考)',
        description: '筛查早期自闭症谱系障碍(ASD)风险的社交互动指标。',
        tags: ['autism', 'social'],
        questions: [
          "当你指着房间另一边的东西时，孩子会看那个东西吗？",
          "孩子会玩“假装”游戏吗？（例如假装用积木打电话）",
          "孩子会对其他孩子感兴趣吗？",
          "孩子会用手指指东西表示需要帮助或分享兴趣吗？",
          "当你叫孩子的名字时，他/她会立刻有反应看你吗？"
        ]
      },
      {
        id: 'sensory',
        title: '感官敏感度观察',
        description: '评估孩子对声音、触觉、动作的反应，筛查感官统合问题。',
        tags: ['sensory', 'autism_risk'],
        questions: [
          "孩子是否对吹风机、吸尘器等声音表现出极度恐惧？",
          "孩子是否抗拒某种质地的衣服或食物？",
          "孩子是否过度寻求旋转、跳跃等强烈刺激？",
          "孩子是否不喜欢被拥抱或触碰？",
          "目光接触是否短暂或经常回避？"
        ]
      }
    ],
    preschool: [
      {
        id: 'social_emotional',
        title: '学前社交情感能力',
        description: '评估情绪理解、同理心及与同伴互动的能力。',
        tags: ['social', 'emotional'],
        questions: [
          "孩子能辨别他人的情绪（如开心、难过）吗？",
          "孩子能与其他小朋友轮流玩玩具吗？",
          "在游戏中输了，孩子能较快平复情绪吗？",
          "孩子能用语言而不是肢体动作表达愤怒吗？",
          "孩子能遵守简单的游戏规则吗？"
        ]
      },
      {
        id: 'adhd_early',
        title: '早期多动与专注力观察',
        description: '区分正常的活泼好动与潜在的注意力缺陷/多动问题。',
        tags: ['adhd', 'impulse'],
        questions: [
          "孩子是否表现得像“装了马达”一样动个不停，很难安静下来？",
          "孩子是否经常因冲动而发生危险（如不看路冲到街上）？",
          "孩子玩游戏时，是否经常不到几分钟就换一个？",
          "孩子是否经常在别人说话时插嘴或打断？",
          "在需要安静的场合（如听故事），孩子是否很难维持坐姿？"
        ]
      },
      {
        id: 'behavior_check',
        title: '早期行为困扰筛查',
        description: '筛查攻击性行为、退缩行为及注意力广度。',
        tags: ['behavior', 'attention'],
        questions: [
          "孩子是否经常因为小事发脾气，持续时间很长？",
          "孩子是否很难安静坐下来听完一个简短的故事（5分钟）？",
          "孩子是否有攻击他人（打、咬、踢）的行为？",
          "孩子是否在陌生环境中表现出过度的退缩或粘人？",
          "孩子是否经常表现得坐立不安，动个不停？"
        ]
      }
    ],
    school: [
      {
        id: 'attention_snap',
        title: '专注力与多动评估 (SNAP-IV参考)',
        description: '评估注意力缺陷及多动冲动症状。',
        tags: ['adhd', 'focus'],
        questions: [
          "在做作业或听课时，是否经常无法注意细节或因粗心犯错？",
          "在完成任务时，是否难以保持注意力集中？",
          "别人对他/她说话时，是否常常好像没在听？",
          "是否经常无法完成作业或家务（并非因为不懂或反抗）？",
          "是否经常弄丢东西（如文具、书本）？",
          "是否经常手脚动个不停，或在座位上扭来扭去？",
          "是否经常在不适当的场合跑来跑去或爬高爬低？",
          "是否经常打断别人的谈话或游戏？"
        ]
      },
      {
        id: 'autism_social',
        title: '社交互动与刻板行为 (ASSQ参考)',
        description: '筛查学龄期儿童的高功能自闭症或亚斯伯格特质。',
        tags: ['autism', 'social'],
        questions: [
          "是否表现得像个“小大人”，说话方式过于成熟或书面化？",
          "是否对某些特定话题（如恐龙、火车时刻表）有强烈的、狭隘的兴趣？",
          "是否很难理解同龄人的玩笑、隐喻或讽刺？",
          "是否坚持某些固定的生活程序，一旦改变就非常生气？",
          "在社交场合，是否表现得有些笨拙，不懂得察言观色？"
        ]
      },
      {
        id: 'conduct_sdq',
        title: '长处与困难问卷 (SDQ-行为版)',
        description: '评估品行问题、同伴关系及亲社会行为。',
        tags: ['conduct', 'social'],
        questions: [
          "是否经常发脾气或情绪失控？",
          "是否通常比较听话，照大人的吩咐做事？",
          "是否经常与别的孩子吵架或欺负别人？",
          "在不开心时，是否经常表现得不快乐、沮丧或流泪？",
          "比起同龄人，是否更喜欢和大人相处？"
        ]
      }
    ],
    teen: [
      {
        id: 'depression_phq',
        title: '青少年抑郁情绪筛查 (PHQ-9参考)',
        description: '筛查持续的低落情绪、兴趣丧失及生理症状。',
        tags: ['depression', 'mood'],
        questions: [
          "在过去两周，是否感到做事没有兴趣或乐趣？",
          "在过去两周，是否感到心情低落、沮丧或绝望？",
          "是否有入睡困难、睡不安稳，或睡眠过多？",
          "是否感到疲倦或没有活力？",
          "食欲是否发生明显变化（没胃口或吃太多）？",
          "是否觉得自己很糟糕，或者觉得自己让父母失望了？"
        ]
      },
      {
        id: 'emotional_psc',
        title: '青少年焦虑与压力 (GAD参考)',
        description: '筛查广泛性焦虑与学业/社交压力。',
        tags: ['anxiety', 'stress'],
        questions: [
          "是否经常感到紧张、焦虑或烦躁？",
          "是否无法停止哪怕是很小的担忧？",
          "是否因为担心而很难放松下来？",
          "是否很容易变得恼怒或急躁？",
          "是否经常因为焦虑而感到身体不适（头痛、胃痛）？"
        ]
      },
      {
        id: 'autonomy',
        title: '独立性与亲子冲突',
        description: '评估亲子关系的边界、沟通与权力斗争。',
        tags: ['family', 'conflict'],
        questions: [
          "是否凡事都想和父母对着干，即使自己也并不想那样做？",
          "是否隐瞒自己的行踪或网络活动？",
          "在遇到重大困难时，是否愿意向父母求助？",
          "是否觉得父母完全不理解自己的世界？",
          "情绪波动是否极不稳定？"
        ]
      }
    ]
  };
};

export const getSolutions = (lang: Language): SolutionCard[] => {
  if (lang === 'en') {
    return [
      {
        id: 'attention',
        title: 'Undue Attention',
        subtitle: '"Look at me! Look at me!"',
        icon: '👀',
        description: 'The child feels they only belong when they are being noticed. Manifests as clinging, clowning, or interrupting.',
        kidSkill: 'Skill to learn: **Expressing needs positively** and **Playing independently**.\nName it: "The Star Power" or "Waiting Power".',
        strategiesParent: [
          '**Special Time**: 15 min daily undivided attention.',
          '**Redirect**: Give the child a "Helper" task.',
          '**Non-verbal**: Agree on a secret signal (wink) for "I see you".'
        ],
        strategiesTeacher: [
          '**Roles**: Give the student a specific classroom job.',
          '**Secret Signal**: Tap the desk gently as you pass by.',
          '**Ignore**: Tactically ignore minor misbehavior, praise the positive.'
        ]
      },
      {
        id: 'power',
        title: 'Misguided Power',
        subtitle: '"You can\'t make me!"',
        icon: '⚔️',
        description: 'Child feels they only belong when they are the boss. Manifests as arguing, stubbornness, or defiance.',
        kidSkill: 'Skill to learn: **Cooperation** and **Negotiation**.\nName it: "The Peace Maker" or "Cool Down Superpower".',
        strategiesParent: [
          '**Limited Choices**: "Do you want to brush teeth first or wash face?"',
          '**Withdraw**: "I love you too much to argue." Walk away.',
          '**Routines**: Let the schedule be the boss, not you.'
        ],
        strategiesTeacher: [
          '**Choices**: "You can do it now or during break."',
          '**Class Meetings**: Let students help set rules.',
          '**Private Talk**: Avoid public confrontation.'
        ]
      },
      {
        id: 'revenge',
        title: 'Revenge',
        subtitle: '"I hurt, so you should hurt too"',
        icon: '💔',
        description: 'Child feels hurt and wants to hurt back. Manifests as hurtful words, breaking things, or physical aggression.',
        kidSkill: 'Skill to learn: **Forgiveness** and **Expressing Feelings**.\nName it: "Heart Healer".',
        strategiesParent: [
          '**Repair**: Deal with feelings first. "That sounded hurtful, you must be hurting."',
          '**Apologize**: If you messed up, say sorry.',
          '**Listen**: Don\'t defend, just listen.'
        ],
        strategiesTeacher: [
          '**Connection**: Build a 1-on-1 relationship outside of conflict.',
          '**Avoid Punishment**: Punishment usually fuels the revenge cycle.',
          '**Spotlight Strength**: Publicly acknowledge a talent.'
        ]
      },
      {
        id: 'withdrawal',
        title: 'Assumed Inadequacy',
        subtitle: '"I can\'t, leave me alone"',
        icon: '🐢',
        description: 'Child feels useless and gives up. Manifests as passivity, giving up, or "I don\'t know".',
        kidSkill: 'Skill to learn: **Trying New Things** and **Asking for Help**.\nName it: "The Brave Explorer".',
        strategiesParent: [
          '**Small Steps**: Break big tasks into tiny wins.',
          '**Focus on Process**: "I saw you worked hard on that."',
          '**Stop Criticism**: Stop all criticism, look for any positive.'
        ],
        strategiesTeacher: [
          '**Scaffolding**: Make the task easier to ensure initial success.',
          '**Peer Helper**: Pair with a friendly, non-competitive peer.',
          '**Private Help**: Avoid public focus on their lack of skill.'
        ]
      }
    ];
  }
  return [
    {
      id: 'attention',
      title: '寻求过度关注',
      subtitle: '“看我！看我！”',
      icon: '👀',
      description: '孩子感觉只有被注意到时才有归属感。表现为粘人、搞怪、打断谈话或课堂捣乱。',
      kidSkill: '孩子需要学习的技能是：**以积极的方式表达需求** 和 **独立玩耍/工作**。\n不妨把技能命名为“我是小明星”或“能量等待”。',
      strategiesParent: [
        '**特定时光**：每天15分钟全情投入的陪伴，不做其他事。',
        '**任务转移**：给孩子一个“小帮手”的任务（如洗菜、拿东西）。',
        '**非语言信号**：约定一个暗号（如眨眼）表示“我爱你，我看到了”。'
      ],
      strategiesTeacher: [
        '**职责分工**：在班级里给学生安排一个具体的“职位”或任务。',
        '**非语言暗号**：经过学生桌边时，轻轻敲一下桌子表示“我注意到了”。',
        '**忽视干扰**：对轻微的求关注行为进行战术性忽略，关注正向行为。'
      ]
    },
    {
      id: 'power',
      title: '权力斗争',
      subtitle: '“你管不了我！”',
      icon: '⚔️',
      description: '孩子觉得自己只有说了算才重要。表现为顶嘴、拖延、也就是不听你的。',
      kidSkill: '孩子需要学习的技能是：**合作** 和 **用语言商量**。\n不妨把技能命名为“谈判专家”或“冷静超人”。',
      strategiesParent: [
        '**有限选择**：“你想先刷牙还是先洗脸？”提供两个你都能接受的选项。',
        '**退出冲突**：平静地说“我甚至不想和你争吵”，然后走开，不接招。',
        '**日常惯例表**：建立规则，让“惯例”说了算，而不是家长说了算。'
      ],
      strategiesTeacher: [
        '**提供选择**：“你可以现在开始做题，或者这节课后留下来做。”',
        '**班级会议**：让学生参与制定班规，让他们感到自己有发言权。',
        '**私下沟通**：避免在全班面前与学生对峙，保留彼此面子。'
      ]
    },
    {
      id: 'revenge',
      title: '报复',
      subtitle: '“既然我不快乐，那你也别想好过”',
      icon: '💔',
      description: '孩子感到受伤害，试图反击。表现为说狠话、破坏东西或故意伤害别人。',
      kidSkill: '孩子需要学习的技能是：**宽恕** 和 **表达受伤的感觉**。\n不妨把技能命名为“心灵修补师”或“和平使者”。',
      strategiesParent: [
        '**修复关系**：先处理情绪，再处理事情。“你的话很伤人，但我知道你心里也不好受。”',
        '**道歉**：如果你做错了，真诚向孩子道歉，这示范了负责任。',
        '**倾听**：不辩解，只倾听孩子的感受，让他觉得被理解。'
      ],
      strategiesTeacher: [
        '**建立连接**：寻找机会在课外时间建立一对一的积极互动。',
        '**避免惩罚**：惩罚通常会加剧报复循环，尝试理解背后的伤害。',
        '**鼓励优势**：发现该学生的闪光点，公开肯定他的贡献。'
      ]
    },
    {
      id: 'withdrawal',
      title: '自暴自弃',
      subtitle: '“我做不到，别管我”',
      icon: '🐢',
      description: '孩子感到无能为力，放弃努力。表现为消极、退缩、不想尝试、趴在桌上。',
      kidSkill: '孩子需要学习的技能是：**尝试新事物** 和 **寻求帮助**。\n不妨把技能命名为“勇敢探险家”或“一步一步来”。',
      strategiesParent: [
        '**分解步骤**：把大任务拆解成微小的、容易成功的小步子。',
        '**关注过程**：鼓励努力的过程，而不是结果。“我看到你在这个问题上坚持了很久。”',
        '**不再批评**：停止所有的批评，只寻找优点。'
      ],
      strategiesTeacher: [
        '**脚手架支持**：降低任务难度，让学生先体验成功的滋味。',
        '**同伴互助**：安排一个友好的同伴进行非竞争性的合作。',
        '**私下鼓励**：避免公开关注他的“不会”，私下提供具体的帮助。'
      ]
    }
  ];
};