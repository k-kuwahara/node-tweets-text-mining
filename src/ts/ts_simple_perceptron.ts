////////////////
// 単純パーセプトロン
 
//  訓練データ型
interface LerningData {
    x: number[];    // 入力
    y: number;        // 判別結果
};
 
 
//  入力:input_dimention次元
//  出力:1次元
class SimplePerceptron {
    private input_dimention :number;    // 入力次元
    private w :number[];                // 重み
 
    private LOOP_MAX :number = 1000;    //　学習回数
    private ALPHA :number = 0.05;        // 学習係数
    private T :number = 0.5;            // しきい値
 
    // データの入力次元数を指定して初期化
    constructor(input_dimention: number) {
        // 入力次元設定
        this.input_dimention = input_dimention;
 
        // 乱数による重み初期化
        this.w = new Array(this.input_dimention);
        for(var i :number=0; i<this.input_dimention; i++){
            this.w[i] = Math.random();
        }
    }
 
    // 判定
    public detect(x: number[]): number {
        var sum :number = -this.T;    // はじめにしきい値をいれておく。
        for(var i :number=0; i<this.input_dimention; i++){
            sum += this.w[i]*x[i];
        }
        return (sum>0)?1:0;
    }
 
    // 学習
    public lern(lerning_data: LerningData[]): void{
        // before lerning
        console.log('before : ' + this.w);
 
        var data_num: number = lerning_data.length;
 
        for(var itr :number=0; itr<this.LOOP_MAX; itr++){
            for(var idx :number = 0; idx<data_num; idx++){
                // 現在の重みによる判定結果
                var predict: number = this.detect(lerning_data[idx].x);
 
                // 判定結果が誤りであれば重みベクトルを更新する。
                if(predict != lerning_data[idx].y){
                    for(var i :number=0; i<this.input_dimention; i++){
                        this.w[i] += this.ALPHA * lerning_data[idx].x[i] *(lerning_data[idx].y-predict);
                    }
                }
            }
 
        }
 
        // after lerning
        console.log('after : ' + this.w);
    }
}
 
////////////////
// 訓練データ
var lerning_data: LerningData[] = [
    {x:[0,0],y:0},
    {x:[0,1],y:0},
    {x:[1,0],y:0},
    {x:[1,1],y:1}
];
 
console.log('データ');
console.log(lerning_data);
console.log('');
 
 
////////////////
// 実行
//  パーセプトロン
var p = new SimplePerceptron(2);
 
//  学習前テスト
console.log('学習前');
for(var i :number=0; i<lerning_data.length; i++){
    console.log(i + ":" + (lerning_data[i].y==p.detect(lerning_data[i].x)));
}
console.log('');
 
//  学習
p.lern(lerning_data);
console.log('');
 
// 　学習後テスト
console.log('学習後');
for(var i :number=0; i<lerning_data.length; i++){
    console.log(i + ":" + (lerning_data[i].y==p.detect(lerning_data[i].x)));
}
console.log('');
