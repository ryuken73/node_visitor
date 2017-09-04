class App2() :

    def __init__(self, master, row, column, padx=10, pady=5, sticky='W'):
        self.master = master
        self.frames = {}
        for r in range(row) :
            for c in range(column) :
                frameKey = str(r) + '-' + str(c)
                self.frames[frameKey] = {}
                self.frames[frameKey]['widget'] = Frame(master)
                self.frames[frameKey]['widget'].grid(row=r, column=c, padx=padx, pady=pady, sticky=sticky)

    def add_label(self, parent, row, column, label_options, padx=10, pady=5, sticky='W') :
        '''
        :param parent: normaly self.frames['0-0']['widget'] ==> type = Frame
        :param row: label's row position
        :param column: label's column postion
        :param options: lable's options
        :return:
        '''
        widgetKey = str(row) + '-' + str(column)
        parent[widgetKey] = Label(parent['widget'], label_options)
        parent[widgetKey].grid(row=row, column=column, padx=padx, pady=pady, sticky=sticky)

    def add_Entry(self, parent, row, column, entry_options, padx=10, pady=5, sticky='W' ):

        widgetKey = str(row) + '-' + str(column)
        parent[widgetKey] = Entry(parent['widget'], entry_options)
        parent[widgetKey].grid(row=row, column=column, padx=padx, pady=pady, sticky=sticky)

    def copy(self, event):
        print '*' * 10
        '''
        event.char : number, alphabet, hangul wangung
        event.keysym : number, alphabet, ?? // encoding 문제일지도
        event.keycode : keycode
       '''
        print event.char
        print event.keysym
        print event.keycode
        print '*' * 10
        self.frames['0-0']['1-1'].insert(END,event.char)


root = Tk()
app = App2(root,1,1)
app.add_label(app.frames['0-0'], 0, 0, {'text':"ELS host address"})
app.add_Entry(app.frames['0-0'], 0, 1, {'width': 50})
app.add_label(app.frames['0-0'], 1, 0, {'text':"Index pattern"})
app.add_Entry(app.frames['0-0'], 1, 1, {'width': 50})

app.frames['0-0']['0-1'].bind('<Key>', app.copy)

#app.add_frame()

root.mainloop()