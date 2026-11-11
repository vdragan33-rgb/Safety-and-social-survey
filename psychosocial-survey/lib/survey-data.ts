// Generated from the approved survey content. Edit here to change questions.
// Items are [id, Portuguese text, English text, reversed?].
export type Scale = { n: number; base?: number; labels: [string, string][] };
export type Item = [string, string, string] | [string, string, string, boolean];
export type Dim = {
  id: string;
  t: [string, string];
  h: [string, string];
  sc: "freq" | "agree" | "expo";
  dir: "risk" | "res" | "expo";
  field?: boolean;
  items: Item[];
};

export const SC: Record<string, Scale> = {
  freq:{n:5,labels:[["Nunca","Never"],["Raramente","Rarely"],["Às vezes","Sometimes"],["Frequentemente","Often"],["Sempre","Always"]]},
  agree:{n:5,labels:[["Discordo totalmente","Strongly disagree"],["Discordo","Disagree"],["Nem concordo nem discordo","Neutral"],["Concordo","Agree"],["Concordo totalmente","Strongly agree"]]},
  expo:{n:4,base:0,labels:[["Nunca","Never"],["Uma vez","Once"],["Algumas vezes","A few times"],["Frequentemente","Often"]]}
};
/* items: [id, pt, en, reversed?] */
export const DIMS: Dim[] = [
 {id:"carga",t:["Carga e ritmo de trabalho","Workload and pace"],h:["Quantidade de trabalho, prazos e pausas.","Amount of work, deadlines and breaks."],sc:"freq",dir:"risk",items:[
  ["carga1","Tenho mais trabalho do que consigo concluir dentro do horário previsto.","I have more work than I can finish within my scheduled hours."],
  ["carga2","Tenho de trabalhar a um ritmo muito acelerado.","I have to work at a very fast pace."],
  ["carga3","Os prazos que me são dados são difíceis de cumprir.","The deadlines I am given are hard to meet."],
  ["carga4","Fico sem tempo para pausas durante o dia de trabalho.","I have no time for breaks during the working day."]]},
 {id:"tempo",t:["Tempo de trabalho e vida pessoal","Working time and personal life"],h:["Horários, disponibilidade fora de horas e descanso.","Schedules, availability outside working hours, and rest."],sc:"freq",dir:"risk",items:[
  ["tempo1","O meu trabalho obriga-me a estar disponível fora do horário (chamadas, mensagens, e-mails).","My work requires me to be available outside working hours (calls, messages, emails)."],
  ["tempo2","O horário e as deslocações dificultam a minha vida familiar e pessoal.","My schedule and travel make my family and personal life difficult."],
  ["tempo3","Tenho dificuldade em descansar o suficiente entre dias de trabalho.","I find it hard to rest enough between working days."]]},
 {id:"emoc",t:["Exigências emocionais","Emotional demands"],h:["Situações desgastantes e lidar com pessoas difíceis.","Draining situations and dealing with difficult people."],sc:"freq",dir:"risk",items:[
  ["emoc1","O meu trabalho coloca-me em situações emocionalmente desgastantes.","My work puts me in emotionally draining situations."],
  ["emoc2","Tenho de lidar com pessoas agressivas, ansiosas ou muito exigentes.","I have to deal with aggressive, anxious or very demanding people."]]},
 {id:"auton",t:["Autonomia e desenvolvimento","Autonomy and development"],h:["Margem para decidir como trabalha e para aprender.","Room to decide how you work and to learn."],sc:"agree",dir:"res",items:[
  ["auton1","Posso decidir como organizo e executo o meu trabalho.","I can decide how I organise and carry out my work."],
  ["auton2","Tenho influência sobre a quantidade de trabalho que me é atribuída.","I have influence over the amount of work assigned to me."],
  ["auton3","Sou consultado(a) sobre decisões que afetam o meu trabalho.","I am consulted on decisions that affect my work."],
  ["auton4","Tenho oportunidade de aprender e de desenvolver competências.","I have the chance to learn and develop skills."]]},
 {id:"papel",t:["Clareza do papel e meios","Role clarity and resources"],h:["Saber o que se espera de si e ter o que precisa para o fazer.","Knowing what is expected of you and having what you need to do it."],sc:"agree",dir:"res",items:[
  ["papel1","Sei claramente o que se espera de mim.","I know clearly what is expected of me."],
  ["papel2","Recebo instruções contraditórias de pessoas diferentes.","I receive contradictory instructions from different people.",true],
  ["papel3","Tenho os meios, a informação e a formação de que preciso para fazer bem o trabalho.","I have the means, information and training I need to do my work well."]]},
 {id:"apoio",t:["Apoio social e pertença","Social support and belonging"],h:["Colegas, coordenação e sentimento de equipa.","Colleagues, coordination and sense of team."],sc:"agree",dir:"res",items:[
  ["apoio1","Posso contar com os colegas quando tenho dificuldades.","I can count on colleagues when I have difficulties."],
  ["apoio2","Posso contar com a chefia ou coordenação quando tenho dificuldades.","I can count on my manager or coordinator when I have difficulties."],
  ["apoio3","Sinto-me parte de uma equipa, mesmo quando trabalho sozinho(a) ou à distância.","I feel part of a team, even when I work alone or remotely."]]},
 {id:"lider",t:["Liderança","Leadership"],h:["A forma como a chefia ou coordenação trabalha consigo.","How your manager or coordinator works with you."],sc:"agree",dir:"res",items:[
  ["lider1","A chefia ouve as minhas preocupações e responde-lhes.","My manager listens to my concerns and responds to them."],
  ["lider2","As chefias tratam as pessoas com respeito e de forma justa.","Managers treat people with respect and fairly."]]},
 {id:"reconh",t:["Reconhecimento e justiça","Recognition and fairness"],h:["Valorização do trabalho, distribuição de tarefas e retribuição.","Appreciation of work, allocation of tasks and pay."],sc:"agree",dir:"res",items:[
  ["reconh1","O meu trabalho é reconhecido por quem decide.","My work is recognised by the people who make decisions."],
  ["reconh2","As tarefas e as oportunidades são distribuídas de forma justa.","Tasks and opportunities are distributed fairly."],
  ["reconh3","A remuneração ou os honorários correspondem ao trabalho que faço.","My pay or fees match the work I do."]]},
 {id:"comun",t:["Comunicação e mudança","Communication and change"],h:["Como a informação circula na empresa.","How information flows in the company."],sc:"agree",dir:"res",items:[
  ["comun1","Sou informado(a) a tempo das decisões e mudanças que me afetam.","I am informed in good time of decisions and changes that affect me."],
  ["comun2","A informação importante chega a todos da mesma forma, seja qual for o local de trabalho ou o vínculo.","Important information reaches everyone in the same way, whatever their workplace or type of engagement."]]},
 {id:"segur",t:["Segurança do vínculo e do rendimento","Job and income security"],h:["Estabilidade da relação de trabalho ou de prestação de serviços.","Stability of the employment or service relationship."],sc:"agree",dir:"risk",items:[
  ["segur1","Preocupa-me a estabilidade do meu vínculo ou da minha fonte de rendimento.","I am worried about the stability of my engagement or my source of income."],
  ["segur2","Tenho receio de perder trabalho se levantar problemas ou recusar uma tarefa.","I fear losing work if I raise problems or refuse a task."]]},
 {id:"terreno",t:["Trabalho no terreno","Fieldwork"],h:["Inspeções, deslocações e trabalho fora do escritório.","Inspections, travel and work outside the office."],sc:"freq",dir:"risk",field:true,items:[
  ["terr1","Trabalho sozinho(a) em locais isolados ou sem cobertura de comunicações.","I work alone in isolated places or without communications coverage."],
  ["terr2","Sou alvo de hostilidade, pressão ou ameaças por parte de pessoas inspecionadas ou de terceiros.","I am subjected to hostility, pressure or threats from people being inspected or third parties."],
  ["terr3","As deslocações longas ou a condução causam-me cansaço excessivo.","Long journeys or driving leave me excessively tired."],
  ["terr4","Sinto que, numa emergência, não teria apoio rápido.","I feel that in an emergency I would not get quick support."],
  ["terr5","Tenho dificuldade em contactar o escritório ou a coordenação quando preciso.","I find it hard to reach the office or coordination when I need to."]]},
 {id:"saude",t:["Saúde e bem-estar relacionados com o trabalho","Work-related health and wellbeing"],h:["Como se sente por causa do trabalho.","How you feel because of work."],sc:"freq",dir:"risk",items:[
  ["saude1","Sinto-me física ou mentalmente exausto(a) no fim do dia de trabalho.","I feel physically or mentally exhausted at the end of the working day."],
  ["saude2","Tenho dificuldade em dormir por causa de preocupações do trabalho.","I have trouble sleeping because of work worries."],
  ["saude3","Sinto-me tenso(a), irritável ou ansioso(a) por causa do trabalho.","I feel tense, irritable or anxious because of work."]]},
 {id:"satis",t:["Satisfação global","Overall satisfaction"],h:["",""],sc:"agree",dir:"res",items:[
  ["satis1","No geral, estou satisfeito(a) com o meu trabalho.","Overall, I am satisfied with my work."]]},
 {id:"assed",t:["Assédio, violência e discriminação","Harassment, violence and discrimination"],h:["Com que frequência passou por cada situação nos últimos 12 meses, no trabalho ou por causa dele. Inclui situações causadas por colegas, chefias ou pessoas externas.","How often you went through each situation in the last 12 months, at work or because of work. This includes situations caused by colleagues, managers or external people."],sc:"expo",dir:"expo",items:[
  ["ass1","Humilhação, ofensas, isolamento ou desvalorização repetida (assédio moral).","Humiliation, insults, isolation or repeated belittling (bullying or moral harassment)."],
  ["ass2","Comentários, gestos ou avanços de natureza sexual indesejados (assédio sexual).","Unwanted comments, gestures or advances of a sexual nature (sexual harassment)."],
  ["ass3","Gritos, insultos ou ameaças (violência verbal).","Shouting, insults or threats (verbal violence)."],
  ["ass4","Agressão ou intimidação física.","Physical assault or intimidation."],
  ["ass5","Violência ou ameaças por parte de pessoas externas (inspecionados, clientes, público).","Violence or threats from external people (people inspected, clients, the public)."],
  ["ass6","Tratamento desfavorável por idade, género, origem, deficiência, religião ou outro motivo.","Unfavourable treatment because of age, gender, origin, disability, religion or another reason."]]},
 {id:"canal",t:["Prevenção e denúncia","Prevention and reporting"],h:["",""],sc:"agree",dir:"res",items:[
  ["canal1","Sei a quem posso comunicar uma situação de assédio ou violência.","I know who I can report a situation of harassment or violence to."],
  ["canal2","Conheço o código de conduta da empresa sobre assédio.","I know the company's code of conduct on harassment."],
  ["canal3","Acredito que uma queixa seria tratada com confidencialidade e sem represálias.","I believe a complaint would be handled confidentially and without retaliation."]]}
];
export const CTX_LOCAL: [string, string, string][] = [["escritorio","Escritório","Office"],["terreno","Terreno","Field"],["ambos","Ambos","Both"]];
export const CTX_VINC: [string, string, string][] = [["proprio","Colaborador da empresa","Company employee"],["externo","Prestador externo","External provider"],["freelancer","Trabalhador independente (freelancer)","Freelancer"],["nd","Prefiro não indicar","Prefer not to say"]];
