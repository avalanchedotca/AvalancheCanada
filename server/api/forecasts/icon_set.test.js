
var icon_set = require('./icon_set');

var danger_data = {
    south_col: [
        {
            "date": "2019-01-01T00:00:00Z",
            "dangerRating": {
                "alp": "2:Moderate",
                "tln": "2:Moderate",
                "btl": "2:Moderate"
            }
        },
        {
            "date": "2019-01-02T00:00:00Z",
            "dangerRating": {
                "alp": "2:Moderate",
                "tln": "2:Moderate",
                "btl": "1:Low"
            }
        },
        {
            "date": "2019-01-03T00:00:00Z",
            "dangerRating": {
                "alp": "2:Moderate",
                "tln": "2:Moderate",
                "btl": "1:Low"
            }
        }
    ],
    glacier:[
        {
            "date": "2019-10-02T00:00:00",
            "dangerRating": {
                "alp": "N/A:No Rating",
                "tln": "N/A:No Rating",
                "btl": "N/A:No Rating"
            }
        },
        {
            "date": "2019-10-03T00:00:00",
            "dangerRating": {
                "alp": "N/A:No Rating",
                "tln": "N/A:No Rating",
                "btl": "N/A:No Rating"
            }
        },
        {
            "date": "2019-10-04T00:00:00",
            "dangerRating": {
                "alp": "N/A:No Rating",
                "tln": "N/A:No Rating",
                "btl": "N/A:No Rating"
            }
        }
    ,]
};

describe('dangerIconSet - the basics', function() {
    Object.keys(danger_data).map(function(key){
        var set = icon_set.genDangerIconSet(-8, danger_data[key]);
        test(key + ' is defined', function(){
            expect(set).toBeDefined();
        });
        test(key + ' has 3 items', function(){
            expect(set.length).toBe(3);
        });
        test(key + ' first item starts at year 0', function(){
            var first = set[0];
            expect(first.from).toMatch(/^0001-/);
        });
        test(key + ' last item is from year 9999', function(){
            var last = set[set.length - 1];
            expect(last.to).toMatch(/^9999-/);
        });
        test(key + ' from/to days line up ', function(){
            expect(set[0].to).toEqual(set[1].from);
            expect(set[1].to).toEqual(set[2].from);
        });
    });
});